import dayjs from 'dayjs';
import { type DocumentData, type FirestoreDataConverter, QueryDocumentSnapshot, type SnapshotOptions, Timestamp, doc, collection } from 'firebase/firestore';
import { db } from './firebase';
import { type IAccount, type ICard, type IAppModules, type IBrokerConfig, type ICarMileageRecord, type ICategory, type IETFTransaction, type IPortfolioSnapshot, type IRecurringTransaction, type ITireChangeRecord, type ITireSettings, type BrokerAccount, type AssetHolding, type CashAdjustment, type DividendEntry, type BudgetTarget } from '../store/types';

/**
 * Raw shapes read back from Firestore.
 *
 * Firestore stores are schemaless: documents written by older app versions
 * (or by hand in the console) may be missing fields or carry wrong types.
 * Every field is therefore typed as `unknown` and narrowed by the readers
 * below, so a malformed document degrades to a documented default instead of
 * silently poisoning downstream arithmetic.
 */

/** A Firestore object value with no compile-time knowledge of its fields. */
type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord =>
  typeof value === 'object' && value !== null ? (value as RawRecord) : {};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Narrows each element of an unknown array to an object, dropping primitives. */
const asRecordArray = (value: unknown): RawRecord[] =>
  asArray(value)
    .filter((el): el is RawRecord => typeof el === 'object' && el !== null)
    .map(asRecord);

const readString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const readNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback;

/** Keeps only string entries — mirrors the legacy `filter(sc => typeof sc === 'string')`. */
const readStringArray = (value: unknown): string[] =>
  asArray(value).filter((el): el is string => typeof el === 'string');

/**
 * Coerces truthiness, matching the legacy `!!value` semantics used for
 * `isDefault` and the `enabledModules` flags. A string `'yes'` is therefore
 * truthy, which the characterization tests pin down.
 *
 * `fallback` is applied only when the value is `null`/`undefined`, mirroring
 * the original `value ?? fallback` rather than a plain falsy check.
 */
const readBoolean = (value: unknown, fallback = false): boolean =>
  value === null || value === undefined ? fallback : Boolean(value);


export interface TransactionDoc {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  recurringLinkId?: string | null;
  consumption?: number | null;
  readingDateStart?: string | null;
  readingDateEnd?: string | null;
  cardId?: string | null;
  createdAt?: ReturnType<typeof Timestamp.now>;
}

export const transactionConverter: FirestoreDataConverter<TransactionDoc> = {
  toFirestore: (tx: TransactionDoc): DocumentData => ({
    id: tx.id,
    date: tx.date,
    description: tx.description,
    category: tx.category,
    subcategory: tx.subcategory,
    amount: tx.amount,
    type: tx.type,
    accountId: tx.accountId,
    recurringLinkId: tx.recurringLinkId ?? null,
    consumption: tx.consumption ?? null,
    readingDateStart: tx.readingDateStart ?? null,
    readingDateEnd: tx.readingDateEnd ?? null,
    cardId: tx.cardId ?? null,
    createdAt: tx.createdAt ?? Timestamp.now(),
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): TransactionDoc => {
    const data = snapshot.data(options);
    return {
      id: data.id ?? '',
      date: data.date ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      subcategory: data.subcategory ?? '',
      amount: typeof data.amount === 'number' ? data.amount : 0,
      type: data.type === 'income' || data.type === 'expense' || data.type === 'transfer' ? data.type : 'expense',
      accountId: data.accountId ?? 'default-main',
      recurringLinkId: data.recurringLinkId,
      consumption: typeof data.consumption === 'number' ? data.consumption : (typeof data.consumption === 'string' && data.consumption !== '' ? Number(data.consumption) : undefined),
      readingDateStart: data.readingDateStart,
      readingDateEnd: data.readingDateEnd,
      cardId: data.cardId || undefined,
    };
  },
};

export function getTransactionDocRef(userId: string, txnId: string) {
  return doc(db, 'users', userId, 'transactions', txnId).withConverter(transactionConverter);
}

export function getTransactionsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'transactions').withConverter(transactionConverter);
}

export interface RecurringTransactionDoc {
  id: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  dayOfMonth: number;
  accountId: string;
  startDate: string;
  endDate?: string | null;
  frequency?: 'monthly' | 'yearly';
  monthOfYear?: number;
  lastGeneratedUpTo?: string;
  cardId?: string;
}

export const recurringTransactionConverter: FirestoreDataConverter<RecurringTransactionDoc> = {
  toFirestore: (r: RecurringTransactionDoc): DocumentData => ({
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
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): RecurringTransactionDoc => {
    const data = snapshot.data(options);
    return {
      id: data.id ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      subcategory: data.subcategory ?? '',
      amount: typeof data.amount === 'number' ? data.amount : 0,
      type: data.type === 'income' || data.type === 'expense' || data.type === 'transfer' ? data.type : 'expense',
      dayOfMonth: typeof data.dayOfMonth === 'number' ? data.dayOfMonth : 1,
      accountId: data.accountId ?? 'default-main',
      startDate: data.startDate ?? '',
      endDate: data.endDate,
      frequency: data.frequency === 'yearly' || data.frequency === 'monthly' ? data.frequency : 'monthly',
      ...(data.monthOfYear != null ? { monthOfYear: data.monthOfYear } : {}),
      ...(data.lastGeneratedUpTo ? { lastGeneratedUpTo: data.lastGeneratedUpTo } : {}),
      ...(data.cardId ? { cardId: data.cardId } : {}),
    };
  },
};

export function getRecurringDocRef(userId: string, recurringId: string) {
  return doc(db, 'users', userId, 'recurringTransactions', recurringId).withConverter(recurringTransactionConverter);
}

export function getRecurringTransactionsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'recurringTransactions').withConverter(recurringTransactionConverter);
}

export interface PacState {
  lastGenerationDate: string | null;
  pendingTransaction: {
    brokerId: string;
    amount: number;
    date: string;
    status: 'pending' | 'confirmed' | 'executed';
  } | null;
  perBrokerLastGeneration: Record<string, string>;
}

export interface UserDoc {
  initialBalance: number;
  categories: ICategory[];
  incomeCategories: ICategory[];
  accounts: IAccount[];
  cards: ICard[];
  recurringTransactions: IRecurringTransaction[];
  carMileage: ICarMileageRecord[];
  carInitialMileage: number;
  tireSettings: ITireSettings;
  tireChanges: ITireChangeRecord[];
  enabledModules: IAppModules;
  balanceStartDate: string;
  deletedRecurringInstances?: { recurringLinkId: string; date: string }[];
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerAccounts: BrokerAccount[];
  assetHoldings: AssetHolding[];
  cashAdjustments: CashAdjustment[];
  dividendEntries: DividendEntry[];
  budgetTargets: BudgetTarget[];
  pacState?: PacState;
  /** @deprecated Legacy field — kept for backward-compatible reads during migration. Will be removed after all users migrate. */
  brokerConfig?: IBrokerConfig;
}

export const userDocConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore: (userDoc: UserDoc): DocumentData => {
    return {
      initialBalance: userDoc.initialBalance || 0,
      categories: userDoc.categories,
      incomeCategories: userDoc.incomeCategories,
      accounts: userDoc.accounts,
      cards: userDoc.cards || [],
      recurringTransactions: userDoc.recurringTransactions.map(r => ({
        id: r.id,
        description: r.description,
        category: r.category,
        subcategory: r.subcategory,
        amount: r.amount,
        type: r.type,
        accountId: r.accountId,
        dayOfMonth: r.dayOfMonth,
        startDate: r.startDate,
        endDate: r.endDate ?? null,
        frequency: r.frequency || 'monthly',
        ...(r.cardId ? { cardId: r.cardId } : {}),
      })),
      carMileage: userDoc.carMileage,
      carInitialMileage: userDoc.carInitialMileage || 0,
      tireSettings: userDoc.tireSettings || { summerModel: '', winterModel: '', initialTireType: 'summer' },
      tireChanges: userDoc.tireChanges || [],
      enabledModules: userDoc.enabledModules,
      balanceStartDate: userDoc.balanceStartDate || '2026-01-01',
      deletedRecurringInstances: userDoc.deletedRecurringInstances || [],
      etfTransactions: userDoc.etfTransactions || [],
      portfolioSnapshots: userDoc.portfolioSnapshots || [],
      brokerAccounts: userDoc.brokerAccounts || [{ id: 'broker-1', name: 'Trade Republic', baseLumpSum: 0, monthlyPacAmount: 0, interestRate: 0 }],
      assetHoldings: userDoc.assetHoldings || [],
      cashAdjustments: userDoc.cashAdjustments || [],
      dividendEntries: userDoc.dividendEntries || [],
      budgetTargets: userDoc.budgetTargets || [],
      pacState: userDoc.pacState || { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
      // Legacy brokerConfig — kept for backward-compatible reads during migration window
      brokerConfig: userDoc.brokerConfig || { brokerName: 'Trade Republic', lumpSumAmount: 0, monthlyPacAmount: 0, ticker: 'EUNL', interestRate: 0 },
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDoc => {
    const data = snapshot.data(options);

    const initialBalance: number = readNumber(data.initialBalance);

    const categories: ICategory[] = asRecordArray(data.categories).map(c => ({
      name: readString(c.name),
      subcategories: readStringArray(c.subcategories),
    }));

    const incomeCategories: ICategory[] = asRecordArray(data.incomeCategories).map(c => ({
      name: readString(c.name),
      subcategories: readStringArray(c.subcategories),
    }));

    const accounts: IAccount[] = asRecordArray(data.accounts).map(a => ({
      id: readString(a.id),
      name: readString(a.name),
      initialBalance: readNumber(a.initialBalance),
      isDefault: readBoolean(a.isDefault),
    }));

    const cards: ICard[] = asRecordArray(data.cards).map(c => ({
      id: readString(c.id),
      name: readString(c.name),
      type: c.type === 'debit' ? 'debit' : 'credit',
      plafond: readNumber(c.plafond),
      billingDay: readNumber(c.billingDay, 1),
      accountId: readString(c.accountId),
    }));

    const recurringTransactions: IRecurringTransaction[] = asRecordArray(data.recurringTransactions).map(r => ({
      id: readString(r.id),
      description: readString(r.description),
      category: readString(r.category),
      subcategory: readString(r.subcategory),
      amount: readNumber(r.amount),
      type: r.type === 'income' || r.type === 'expense' || r.type === 'transfer' ? r.type : 'expense',
      accountId: readString(r.accountId, 'default-main'),
      dayOfMonth: readNumber(r.dayOfMonth, 1),
      startDate: readString(r.startDate),
      endDate: r.endDate as string | null | undefined,
      frequency: r.frequency === 'yearly' || r.frequency === 'monthly' ? r.frequency : 'monthly',
      ...(r.monthOfYear ? { monthOfYear: r.monthOfYear as number } : {}),
      ...(r.cardId ? { cardId: readString(r.cardId) } : {}),
    }));

    const carMileage: ICarMileageRecord[] = asRecordArray(data.carMileage).map(m => ({
      id: readString(m.id),
      year: readNumber(m.year, readNumber(data.year)),
      month: readNumber(m.month, readNumber(data.month)),
      reading: readNumber(m.reading),
    }));

    const carInitialMileage: number = readNumber(data.carInitialMileage);

    const rawTireSettings = asRecord(data.tireSettings);

    const tireSettings: ITireSettings = {
      summerModel: readString(rawTireSettings.summerModel),
      winterModel: readString(rawTireSettings.winterModel),
      initialTireType: rawTireSettings.initialTireType === 'winter' ? 'winter' : 'summer',
    };

    const tireChanges: ITireChangeRecord[] = asRecordArray(data.tireChanges).map(t => ({
      id: readString(t.id),
      date: readString(t.date, dayjs().format('YYYY-MM-DD')),
      type: t.type === 'summer' || t.type === 'winter' ? t.type : 'summer',
      odometer: readNumber(t.odometer),
    }));

    const rawModules = asRecord(data.enabledModules);

    const enabledModules: IAppModules = {
      financeTracker: readBoolean(rawModules.financeTracker, true),
      carManagement: readBoolean(rawModules.carManagement),
      utilityTracker: readBoolean(rawModules.utilityTracker),
      investmentTracking: readBoolean(rawModules.investmentTracking),
      budgetTracking: readBoolean(rawModules.budgetTracking),
    };

    const balanceStartDate: string = readString(data.balanceStartDate, '2026-01-01');

    const deletedRecurringInstances = asRecordArray(data.deletedRecurringInstances).map(d => ({
      recurringLinkId: readString(d.recurringLinkId),
      date: readString(d.date),
    }));

    const etfTransactions: IETFTransaction[] = asRecordArray(data.etfTransactions).map(t => ({
      id: readString(t.id),
      date: readString(t.date),
      ticker: readString(t.ticker),
      description: readString(t.description),
      type: t.type === 'sell' ? 'sell' : 'buy',
      units: readNumber(t.units),
      price: readNumber(t.price),
      totalAmount: readNumber(t.totalAmount),
      accountId: readString(t.accountId),
      brokerId: readString(t.brokerId) || undefined,
      notes: readString(t.notes) || undefined,
    }));

    const portfolioSnapshots: IPortfolioSnapshot[] = asRecordArray(data.portfolioSnapshots).map(s => ({
      id: readString(s.id),
      date: readString(s.date),
      totalInvested: readNumber(s.totalInvested),
      currentValue: readNumber(s.currentValue),
      cashBalance: readNumber(s.cashBalance),
      accruedInterest: readNumber(s.accruedInterest),
      holdings: asRecordArray(s.holdings).map(h => ({
        ticker: readString(h.ticker),
        units: readNumber(h.units),
        avgCost: readNumber(h.avgCost),
        currentPrice: readNumber(h.currentPrice),
        value: readNumber(h.value),
        returnPercent: readNumber(h.returnPercent),
      })),
    }));

    const brokerAccounts: BrokerAccount[] = asRecordArray(data.brokerAccounts).map(b => ({
      id: readString(b.id),
      name: readString(b.name),
      ticker: readString(b.ticker),
      baseLumpSum: readNumber(b.baseLumpSum),
      monthlyPacAmount: readNumber(b.monthlyPacAmount),
      interestRate: readNumber(b.interestRate),
    }));

    const assetHoldings: AssetHolding[] = asRecordArray(data.assetHoldings).map(h => ({
      ticker: readString(h.ticker),
      brokerId: readString(h.brokerId),
      units: readNumber(h.units),
    }));

    const cashAdjustments: CashAdjustment[] = asRecordArray(data.cashAdjustments).map(a => ({
      id: readString(a.id),
      brokerId: readString(a.brokerId),
      amount: readNumber(a.amount),
      date: readString(a.date),
      notes: readString(a.notes) || undefined,
    }));

    const dividendEntries: DividendEntry[] = asRecordArray(data.dividendEntries).map(d => ({
      id: readString(d.id),
      brokerId: readString(d.brokerId),
      ticker: readString(d.ticker),
      amount: readNumber(d.amount),
      date: readString(d.date),
      type: d.type === 'interest' ? 'interest' : 'dividend',
      notes: readString(d.notes) || undefined,
    }));

    // Legacy brokerConfig — kept for backward-compatible reads during migration
    const brokerConfig: IBrokerConfig | undefined = data.brokerConfig ? (() => {
      const raw = asRecord(data.brokerConfig);
      return {
        brokerName: readString(raw.brokerName, 'Trade Republic'),
        lumpSumAmount: readNumber(raw.lumpSumAmount),
        monthlyPacAmount: readNumber(raw.monthlyPacAmount),
        ticker: readString(raw.ticker, 'EUNL'),
        interestRate: readNumber(raw.interestRate),
      };
    })() : undefined;

    const rawPacState = asRecord(data.pacState);

    const pacState: PacState = {
      lastGenerationDate: (rawPacState.lastGenerationDate ?? null) as string | null,
      pendingTransaction: (rawPacState.pendingTransaction ?? null) as PacState['pendingTransaction'],
      perBrokerLastGeneration: asRecord(rawPacState.perBrokerLastGeneration) as PacState['perBrokerLastGeneration'],
    };

    return {
      initialBalance,
      categories,
      incomeCategories,
      accounts,
      cards,
      recurringTransactions,
      carMileage,
      carInitialMileage,
      tireSettings,
      tireChanges,
      enabledModules,
      balanceStartDate,
      deletedRecurringInstances,
      etfTransactions,
      portfolioSnapshots,
      brokerAccounts,
      assetHoldings,
      cashAdjustments,
      dividendEntries,
      budgetTargets: asRecordArray(data.budgetTargets).map(b => ({
        id: readString(b.id),
        category: readString(b.category),
        period: b.period === 'semiannual' || b.period === 'annual' ? b.period : 'monthly',
        targetAmount: readNumber(b.targetAmount),
        color: readString(b.color, '#6366f1'),
        name: readString(b.name) || undefined,
        createdAt: readString(b.createdAt),
        updatedAt: readString(b.updatedAt),
      })),
      pacState,
      brokerConfig,
    };
  }
};
