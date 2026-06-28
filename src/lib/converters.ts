/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { type DocumentData, type FirestoreDataConverter, QueryDocumentSnapshot, type SnapshotOptions } from 'firebase/firestore';
import { type IAccount, type IAppModules, type IBrokerConfig, type ICarMileageRecord, type ICategory, type IETFTransaction, type IPortfolioSnapshot, type IRecurringTransaction, type ITireChangeRecord, type ITireSettings, type ITransaction, type BrokerAccount, type AssetHolding, type CashAdjustment, type DividendEntry } from '../store/types';

export interface UserDoc {
  transactions: ITransaction[];
  initialBalance: number;
  categories: ICategory[];
  incomeCategories: ICategory[];
  accounts: IAccount[];
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
  /** @deprecated Legacy field — kept for backward-compatible reads during migration. Will be removed after all users migrate. */
  brokerConfig?: IBrokerConfig;
}

export const userDocConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore: (userDoc: UserDoc): DocumentData => {
    return {
      transactions: userDoc.transactions.map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        category: t.category,
        subcategory: t.subcategory,
        amount: t.amount,
        type: t.type,
        accountId: t.accountId,
        recurringLinkId: t.recurringLinkId ?? null,
        consumption: t.consumption ?? null,
        readingDateStart: t.readingDateStart ?? null,
        readingDateEnd: t.readingDateEnd ?? null,
      })),
      initialBalance: userDoc.initialBalance || 0,
      categories: userDoc.categories,
      incomeCategories: userDoc.incomeCategories,
      accounts: userDoc.accounts,
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
      // Legacy brokerConfig — kept for backward-compatible reads during migration window
      brokerConfig: userDoc.brokerConfig || { brokerName: 'Trade Republic', lumpSumAmount: 0, monthlyPacAmount: 0, ticker: 'SWDA.MI', interestRate: 0 },
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDoc => {
    const data = snapshot.data(options);

    // Basic validation and type casting
    const transactions: ITransaction[] = Array.isArray(data.transactions) ? data.transactions.map((t: any) => ({
      id: t.id ?? '',
      date: t.date ?? '',
      description: t.description ?? '',
      category: t.category ?? '',
      subcategory: t.subcategory ?? '',
      amount: typeof t.amount === 'number' ? t.amount : 0,
      type: t.type === 'income' || t.type === 'expense' || t.type === 'transfer' ? t.type : 'expense',
      accountId: t.accountId ?? 'default-main',
      recurringLinkId: t.recurringLinkId,
      consumption: typeof t.consumption === 'number' ? t.consumption : (typeof t.consumption === 'string' && t.consumption !== '' ? Number(t.consumption) : undefined),
      readingDateStart: t.readingDateStart,
      readingDateEnd: t.readingDateEnd,
    })) : [];

    const initialBalance: number = typeof data.initialBalance === 'number' ? data.initialBalance : 0;

    const categories: ICategory[] = Array.isArray(data.categories) ? data.categories.map((c: any) => ({
      name: c.name ?? '',
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.filter((sc: any) => typeof sc === 'string') : [],
    })) : [];

    const incomeCategories: ICategory[] = Array.isArray(data.incomeCategories) ? data.incomeCategories.map((c: any) => ({
      name: c.name ?? '',
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.filter((sc: any) => typeof sc === 'string') : [],
    })) : [];

    const accounts: IAccount[] = Array.isArray(data.accounts) ? data.accounts.map((a: any) => ({
      id: a.id ?? '',
      name: a.name ?? '',
      initialBalance: typeof a.initialBalance === 'number' ? a.initialBalance : 0,
      isDefault: !!a.isDefault,
    })) : [];

    const recurringTransactions: IRecurringTransaction[] = Array.isArray(data.recurringTransactions) ? data.recurringTransactions.map((r: any) => ({
      id: r.id ?? '',
      description: r.description ?? '',
      category: r.category ?? '',
      subcategory: r.subcategory ?? '',
      amount: typeof r.amount === 'number' ? r.amount : 0,
      type: r.type === 'income' || r.type === 'expense' || r.type === 'transfer' ? r.type : 'expense',
      accountId: r.accountId ?? 'default-main',
      dayOfMonth: typeof r.dayOfMonth === 'number' ? r.dayOfMonth : 1,
      startDate: r.startDate ?? '',
      endDate: r.endDate,
      frequency: r.frequency === 'yearly' || r.frequency === 'monthly' ? r.frequency : 'monthly',
      ...(r.monthOfYear ? { monthOfYear: r.monthOfYear } : {}),
    })) : [];

    const carMileage: ICarMileageRecord[] = Array.isArray(data.carMileage) ? data.carMileage.map((m: any) => ({
      id: m.id ?? '',
      year: typeof m.year === 'number' ? m.year : data.year,
      month: typeof m.month === 'number' ? m.month : data.month,
      reading: typeof m.reading === 'number' ? m.reading : 0,
    })) : [];

    const carInitialMileage: number = typeof data.carInitialMileage === 'number' ? data.carInitialMileage : 0;

    const tireSettings: ITireSettings = {
      summerModel: data.tireSettings?.summerModel ?? '',
      winterModel: data.tireSettings?.winterModel ?? '',
      initialTireType: data.tireSettings?.initialTireType === 'winter' ? 'winter' : 'summer',
    };

    const tireChanges: ITireChangeRecord[] = Array.isArray(data.tireChanges) ? data.tireChanges.map((t: any) => ({
      id: t.id ?? '',
      date: t.date ?? dayjs().format('YYYY-MM-DD'),
      type: t.type === 'summer' || t.type === 'winter' ? t.type : 'summer',
      odometer: typeof t.odometer === 'number' ? t.odometer : 0,
    })) : [];

    const enabledModules: IAppModules = {
      financeTracker: data.enabledModules?.financeTracker ?? true,
      carManagement: !!data.enabledModules?.carManagement,
      utilityTracker: !!data.enabledModules?.utilityTracker,
      investmentTracking: !!data.enabledModules?.investmentTracking,
    };

    const balanceStartDate: string = data.balanceStartDate || '2026-01-01';

    const deletedRecurringInstances = Array.isArray(data.deletedRecurringInstances) ? data.deletedRecurringInstances.map((d: any) => ({
      recurringLinkId: d.recurringLinkId ?? '',
      date: d.date ?? ''
    })) : [];

    const etfTransactions: IETFTransaction[] = Array.isArray(data.etfTransactions) ? data.etfTransactions.map((t: any) => ({
      id: t.id ?? '',
      date: t.date ?? '',
      ticker: t.ticker ?? '',
      description: t.description ?? '',
      type: t.type === 'sell' ? 'sell' : 'buy',
      units: typeof t.units === 'number' ? t.units : 0,
      price: typeof t.price === 'number' ? t.price : 0,
      totalAmount: typeof t.totalAmount === 'number' ? t.totalAmount : 0,
      accountId: t.accountId ?? '',
      notes: t.notes ?? undefined,
    })) : [];

    const portfolioSnapshots: IPortfolioSnapshot[] = Array.isArray(data.portfolioSnapshots) ? data.portfolioSnapshots.map((s: any) => ({
      id: s.id ?? '',
      date: s.date ?? '',
      totalInvested: typeof s.totalInvested === 'number' ? s.totalInvested : 0,
      currentValue: typeof s.currentValue === 'number' ? s.currentValue : 0,
      cashBalance: typeof s.cashBalance === 'number' ? s.cashBalance : 0,
      accruedInterest: typeof s.accruedInterest === 'number' ? s.accruedInterest : 0,
      holdings: Array.isArray(s.holdings) ? s.holdings.map((h: any) => ({
        ticker: h.ticker ?? '',
        units: typeof h.units === 'number' ? h.units : 0,
        avgCost: typeof h.avgCost === 'number' ? h.avgCost : 0,
        currentPrice: typeof h.currentPrice === 'number' ? h.currentPrice : 0,
        value: typeof h.value === 'number' ? h.value : 0,
        returnPercent: typeof h.returnPercent === 'number' ? h.returnPercent : 0,
      })) : [],
    })) : [];

    const brokerAccounts: BrokerAccount[] = Array.isArray(data.brokerAccounts) ? data.brokerAccounts.map((b: any) => ({
      id: b.id ?? '',
      name: b.name ?? '',
      baseLumpSum: typeof b.baseLumpSum === 'number' ? b.baseLumpSum : 0,
      monthlyPacAmount: typeof b.monthlyPacAmount === 'number' ? b.monthlyPacAmount : 0,
      interestRate: typeof b.interestRate === 'number' ? b.interestRate : 0,
    })) : [];

    const assetHoldings: AssetHolding[] = Array.isArray(data.assetHoldings) ? data.assetHoldings.map((h: any) => ({
      ticker: h.ticker ?? '',
      brokerId: h.brokerId ?? '',
      units: typeof h.units === 'number' ? h.units : 0,
    })) : [];

    const cashAdjustments: CashAdjustment[] = Array.isArray(data.cashAdjustments) ? data.cashAdjustments.map((a: any) => ({
      id: a.id ?? '',
      brokerId: a.brokerId ?? '',
      amount: typeof a.amount === 'number' ? a.amount : 0,
      date: a.date ?? '',
      notes: a.notes ?? undefined,
    })) : [];

    const dividendEntries: DividendEntry[] = Array.isArray(data.dividendEntries) ? data.dividendEntries.map((d: any) => ({
      id: d.id ?? '',
      brokerId: d.brokerId ?? '',
      ticker: d.ticker ?? '',
      amount: typeof d.amount === 'number' ? d.amount : 0,
      date: d.date ?? '',
      type: d.type === 'interest' ? 'interest' : 'dividend',
      notes: d.notes ?? undefined,
    })) : [];

    // Legacy brokerConfig — kept for backward-compatible reads during migration
    const brokerConfig: IBrokerConfig | undefined = data.brokerConfig ? {
      brokerName: data.brokerConfig?.brokerName ?? 'Trade Republic',
      lumpSumAmount: typeof data.brokerConfig?.lumpSumAmount === 'number' ? data.brokerConfig.lumpSumAmount : 0,
      monthlyPacAmount: typeof data.brokerConfig?.monthlyPacAmount === 'number' ? data.brokerConfig.monthlyPacAmount : 0,
      ticker: data.brokerConfig?.ticker ?? 'SWDA.MI',
      interestRate: typeof data.brokerConfig?.interestRate === 'number' ? data.brokerConfig.interestRate : 0,
    } : undefined;

    return {
      transactions,
      initialBalance,
      categories,
      incomeCategories,
      accounts,
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
      brokerConfig,
    };
  }
};
