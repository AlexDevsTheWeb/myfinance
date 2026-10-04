import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { db as fakeDb, _resetFakeFirestore, _seedDoc, _getDocData } from '../test/firestore-fake';

vi.mock('firebase/firestore', async () => {
  const fake = await import('../test/firestore-fake');
  return {
    doc: fake.doc,
    collection: fake.collection,
    setDoc: fake.setDoc,
    updateDoc: fake.updateDoc,
    deleteDoc: fake.deleteDoc,
    getDocs: fake.getDocs,
    writeBatch: fake.writeBatch,
    arrayUnion: fake.arrayUnion,
    runTransaction: fake.runTransaction,
    onSnapshot: fake.onSnapshotOrQuery,
    Timestamp: { now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }) },
    query: (ref: unknown) => ref,
    orderBy: () => ({}),
    limit: (n: number) => ({ _limit: n }),
  };
});
vi.mock('../lib/firebase', () => ({ db: fakeDb }));
vi.mock('../lib/i18n', () => ({
  default: { language: 'it', changeLanguage: vi.fn() },
}));
vi.mock('../store/sync', async () => {
  const fake = await import('../test/firestore-fake');
  return {
    getDefaultUserConfig: () => ({
      initialBalance: 0,
      categories: [],
      incomeCategories: [],
      accounts: [],
      cards: [],
      recurringTransactions: [],
      carMileage: [],
      carInitialMileage: 0,
      tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
      tireChanges: [],
      enabledModules: { financeTracker: true, carManagement: false, utilityTracker: false, investmentTracking: false, budgetTracking: false },
      balanceStartDate: '2026-01-01',
      deletedRecurringInstances: [],
      etfTransactions: [],
      portfolioSnapshots: [],
      brokerAccounts: [{ id: 'broker-1', name: 'Trade Republic', ticker: 'EUNL', baseLumpSum: 0, monthlyPacAmount: 0, interestRate: 0 }],
      assetHoldings: [],
      cashAdjustments: [],
      dividendEntries: [],
      budgetTargets: [],
    }),
    getUserDocRef: (uid: string) => fake.doc(fake.db as never, 'users', uid),
    backfillRecurringToSubCollection: vi.fn().mockResolvedValue({ written: 0, skipped: 0 }),
    backfillTransactionsToSubCollection: vi.fn().mockResolvedValue({ written: 0, skipped: 0 }),
  };
});

const TEST_UID = 'test-user-123';
const userPath = `users/${TEST_UID}`;

describe('useSyncFinance', () => {
  beforeEach(() => {
    _resetFakeFirestore();
  });

  it('initializes user doc with defaults when no remote data exists', async () => {
    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({ user: { uid: TEST_UID } as never });

    const { useSyncFinance } = await import('../hooks/useSyncFinance');
    const { useFinanceStore } = await import('../store/useFinanceStore');
    useFinanceStore.setState({ isLoading: true });

    renderHook(() => useSyncFinance());

    await waitFor(() => {
      expect(useFinanceStore.getState().isLoading).toBe(false);
    }, { timeout: 3000 });

    // User doc should have been created
    const docData = _getDocData(userPath);
    expect(docData).toBeDefined();
  });

  it('loads existing user data from Firestore', async () => {
    _seedDoc(userPath, {
      initialBalance: 5000,
      categories: [{ name: 'Test', subcategories: ['Sub'] }],
      incomeCategories: [],
      accounts: [],
      cards: [],
      recurringTransactions: [],
      carMileage: [],
      carInitialMileage: 0,
      tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
      tireChanges: [],
      enabledModules: { financeTracker: true, carManagement: false, utilityTracker: false, investmentTracking: false, budgetTracking: false },
      balanceStartDate: '2026-01-01',
      deletedRecurringInstances: [],
      etfTransactions: [],
      portfolioSnapshots: [],
      brokerAccounts: [],
      assetHoldings: [],
      cashAdjustments: [],
      dividendEntries: [],
      budgetTargets: [],
    });

    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({ user: { uid: TEST_UID } as never });

    const { useSyncFinance } = await import('../hooks/useSyncFinance');
    const { useFinanceStore } = await import('../store/useFinanceStore');
    useFinanceStore.setState({ isLoading: true });

    renderHook(() => useSyncFinance());

    await waitFor(() => {
      expect(useFinanceStore.getState().initialBalance).toBe(5000);
    }, { timeout: 3000 });
  });

  it('no-ops when user is null', async () => {
    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({ user: null });

    const { useSyncFinance } = await import('../hooks/useSyncFinance');
    const { useFinanceStore } = await import('../store/useFinanceStore');
    useFinanceStore.setState({ isLoading: true });

    renderHook(() => useSyncFinance());

    // Should not crash, loading stays true (no init happened)
    await new Promise(r => setTimeout(r, 500));
    expect(useFinanceStore.getState().isLoading).toBe(true);
  });
});

describe('useBudgetSync', () => {
  beforeEach(() => {
    _resetFakeFirestore();
  });

  it('loads budget targets from existing user doc', async () => {
    _seedDoc(userPath, {
      budgetTargets: [
        { id: 'bt-1', category: 'Food', period: 'monthly', targetAmount: 500, color: '#f00', createdAt: '', updatedAt: '' },
      ],
    });

    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({ user: { uid: TEST_UID } as never });

    const { useBudgetSync } = await import('../hooks/useBudgetSync');
    const { useBudgetStore } = await import('../store/useBudgetStore');

    renderHook(() => useBudgetSync());

    await waitFor(() => {
      expect(useBudgetStore.getState().budgetTargets).toHaveLength(1);
    }, { timeout: 3000 });
    expect(useBudgetStore.getState().budgetTargets[0].category).toBe('Food');
  });
});

describe('useInvestmentSync', () => {
  beforeEach(() => {
    _resetFakeFirestore();
  });

  it('loads investment data from existing user doc', async () => {
    _seedDoc(userPath, {
      etfTransactions: [
        { id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Buy', type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1' },
      ],
      portfolioSnapshots: [],
      brokerConfig: { brokerName: 'Trade Republic', lumpSumAmount: 0, monthlyPacAmount: 100, ticker: 'EUNL', interestRate: 3.5 },
      brokerAccounts: [{ id: 'broker-1', name: 'Trade Republic', ticker: 'EUNL', baseLumpSum: 0, monthlyPacAmount: 100, interestRate: 3.5 }],
      cashAdjustments: [],
      dividendEntries: [],
      pacState: { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
    });

    const { useAuthStore } = await import('../store/useAuthStore');
    useAuthStore.setState({ user: { uid: TEST_UID } as never });

    const { useInvestmentSync } = await import('../hooks/useInvestmentSync');
    const { useInvestmentStore } = await import('../store/useInvestmentStore');
    useInvestmentStore.setState({ isLoading: true });

    renderHook(() => useInvestmentSync());

    await waitFor(() => {
      expect(useInvestmentStore.getState().isLoading).toBe(false);
    }, { timeout: 3000 });
    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(1);
    expect(useInvestmentStore.getState().etfTransactions[0].ticker).toBe('EUNL');
  });
});
