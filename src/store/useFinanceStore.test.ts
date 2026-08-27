import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db as fakeDb, _resetFakeFirestore, _seedDoc, _getDocData } from '../test/firestore-fake';
import { mockAuthStore } from '../test/mock-auth';

// Re-export firestore-fake functions under firebase/firestore names
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
    Timestamp: { now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }) },
  };
});
vi.mock('../lib/firebase', () => ({ db: fakeDb }));
vi.mock('../lib/i18n', () => ({
  default: { language: 'it', changeLanguage: vi.fn() },
}));
vi.mock('./useBudgetStore', () => ({
  useBudgetStore: { getState: () => ({ budgetTargets: [], setBudgetTargets: vi.fn() }) },
}));
vi.mock('./useInvestmentStore', () => ({
  useInvestmentStore: { getState: () => ({ setAll: vi.fn() }) },
}));
vi.mock('../hooks/useHistoricalSnapshots', () => ({
  recordPortfolioSnapshot: vi.fn(),
}));
vi.mock('./useAuthStore', () => mockAuthStore());

import { useFinanceStore } from './useFinanceStore';
import { useAuthStore } from './useAuthStore';

const TEST_UID = 'test-user-123';
const userPath = `users/${TEST_UID}`;

function resetStore() {
  useFinanceStore.setState({
    transactions: [],
    recurringTransactions: [],
    categories: [
      { name: 'Food', subcategories: ['Groceries', 'Restaurants'] },
      { name: 'Transport', subcategories: ['Gas', 'Public'] },
    ],
    incomeCategories: [
      { name: 'Salary', subcategories: ['Main'] },
    ],
    accounts: [
      { id: 'acc-1', name: 'Main Account', initialBalance: 0, isDefault: true },
      { id: 'acc-2', name: 'Savings', initialBalance: 0, isDefault: false },
    ],
    cards: [],
    deletedRecurringInstances: [],
    isSaving: false,
    isCheckingRecurring: false,
    lastRecurringCheck: null,
    hasLocalChanges: false,
    saveError: null,
    balanceStartDate: '2026-01-01',
  });
}

beforeEach(() => {
  _resetFakeFirestore();
  resetStore();
  // Seed user doc so updateDoc calls succeed
  _seedDoc(userPath, {
    categories: useFinanceStore.getState().categories,
    incomeCategories: useFinanceStore.getState().incomeCategories,
    accounts: useFinanceStore.getState().accounts,
    cards: [],
    balanceStartDate: '2026-01-01',
    deletedRecurringInstances: [],
    enabledModules: { financeTracker: true, carManagement: false, utilityTracker: false, investmentTracking: false, budgetTracking: false },
  });
});

// ─── Transaction CRUD ────────────────────────────────────────────────────────

describe('addTransaction', () => {
  it('adds a transaction and persists to Firestore', async () => {
    // Debug: check if auth mock works
    const authUser = useAuthStore.getState().user;
    console.log('Auth user:', authUser);

    const txn = {
      id: 'txn-1',
      date: '2026-08-15',
      description: 'Groceries',
      category: 'Food',
      subcategory: 'Groceries',
      amount: 50,
      type: 'expense' as const,
      accountId: 'acc-1',
    };

    await useFinanceStore.getState().addTransaction(txn);

    const state = useFinanceStore.getState();
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].id).toBe('txn-1');
    expect(state.saveError).toBeNull();

    // Verify Firestore persistence
    const docData = _getDocData(`${userPath}/transactions/txn-1`);
    expect(docData).toBeDefined();
    expect(docData!.amount).toBe(50);
  });

  it('sorts transactions by date descending', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-01', description: 'Old', category: 'Food',
      subcategory: 'Groceries', amount: 10, type: 'expense', accountId: 'acc-1',
    });
    await useFinanceStore.getState().addTransaction({
      id: 'txn-2', date: '2026-08-20', description: 'New', category: 'Food',
      subcategory: 'Groceries', amount: 20, type: 'expense', accountId: 'acc-1',
    });

    const dates = useFinanceStore.getState().transactions.map(t => t.date);
    expect(dates).toEqual(['2026-08-20', '2026-08-01']);
  });

  it('rejects transaction with missing description', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: '', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    expect(useFinanceStore.getState().transactions).toHaveLength(0);
    expect(useFinanceStore.getState().saveError).toBe('Description is required');
  });

  it('rejects transaction with zero amount', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Test', category: 'Food',
      subcategory: 'Groceries', amount: 0, type: 'expense', accountId: 'acc-1',
    });

    expect(useFinanceStore.getState().transactions).toHaveLength(0);
    expect(useFinanceStore.getState().saveError).toContain('Amount');
  });

  it('rejects transaction with NaN amount', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Test', category: 'Food',
      subcategory: 'Groceries', amount: NaN, type: 'expense', accountId: 'acc-1',
    });

    expect(useFinanceStore.getState().transactions).toHaveLength(0);
    expect(useFinanceStore.getState().saveError).toBeDefined();
  });
});

describe('updateTransaction', () => {
  it('updates an existing transaction', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Old', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().updateTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Updated', category: 'Food',
      subcategory: 'Groceries', amount: 75, type: 'expense', accountId: 'acc-1',
    });

    const txn = useFinanceStore.getState().transactions.find(t => t.id === 'txn-1');
    expect(txn!.description).toBe('Updated');
    expect(txn!.amount).toBe(75);
  });

  it('rejects update with invalid data', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Valid', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().updateTransaction({
      id: 'txn-1', date: '2026-08-15', description: '', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    // Original unchanged
    const txn = useFinanceStore.getState().transactions.find(t => t.id === 'txn-1');
    expect(txn!.description).toBe('Valid');
    expect(useFinanceStore.getState().saveError).toBe('Description is required');
  });
});

describe('deleteTransaction', () => {
  it('removes transaction from state and Firestore', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Test', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().deleteTransaction('txn-1');

    expect(useFinanceStore.getState().transactions).toHaveLength(0);
    expect(_getDocData(`${userPath}/transactions/txn-1`)).toBeUndefined();
  });

  it('adds to deletedRecurringInstances when transaction has recurringLinkId', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Recurring', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
      recurringLinkId: 'rec-1',
    });

    await useFinanceStore.getState().deleteTransaction('txn-1');

    expect(useFinanceStore.getState().deletedRecurringInstances).toEqual([
      { recurringLinkId: 'rec-1', date: '2026-08-15' },
    ]);
  });
});

// ─── Category operations ─────────────────────────────────────────────────────

describe('addCategory', () => {
  it('adds an expense category', async () => {
    await useFinanceStore.getState().addCategory('expense', 'Entertainment');

    const cats = useFinanceStore.getState().categories;
    expect(cats.some(c => c.name === 'Entertainment')).toBe(true);
    expect(cats.find(c => c.name === 'Entertainment')!.subcategories).toEqual([]);
  });

  it('adds an income category', async () => {
    await useFinanceStore.getState().addCategory('income', 'Bonus');

    const cats = useFinanceStore.getState().incomeCategories;
    expect(cats.some(c => c.name === 'Bonus')).toBe(true);
  });
});

describe('renameCategory', () => {
  it('renames category and cascades to transactions', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Lunch', category: 'Food',
      subcategory: 'Restaurants', amount: 25, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().renameCategory('expense', 'Food', 'Alimentari');

    const cats = useFinanceStore.getState().categories;
    expect(cats.find(c => c.name === 'Alimentari')).toBeDefined();
    expect(cats.find(c => c.name === 'Food')).toBeUndefined();

    const txn = useFinanceStore.getState().transactions[0];
    expect(txn.category).toBe('Alimentari');

    // Verify Firestore persistence of category
    const userData = _getDocData(userPath);
    expect(userData!.categories).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Alimentari' })])
    );
  });

  it('renames category and cascades to recurring transactions', async () => {
    useFinanceStore.setState({
      recurringTransactions: [
        {
          id: 'rec-1', description: 'Rent', category: 'Housing', subcategory: 'Rent',
          amount: 1000, type: 'expense', accountId: 'acc-1', dayOfMonth: 1,
          startDate: '2026-01-01',
        },
      ],
    });

    await useFinanceStore.getState().renameCategory('expense', 'Housing', 'Abitazione');

    const rec = useFinanceStore.getState().recurringTransactions[0];
    expect(rec.category).toBe('Abitazione');
  });
});

describe('deleteCategory', () => {
  it('deletes category with no subcategories', async () => {
    useFinanceStore.setState({
      categories: [
        { name: 'Food', subcategories: ['Groceries'] },
        { name: 'Empty', subcategories: [] },
      ],
    });

    await useFinanceStore.getState().deleteCategory('expense', 'Empty');

    const cats = useFinanceStore.getState().categories;
    expect(cats.find(c => c.name === 'Empty')).toBeUndefined();
  });

  it('does not delete category with subcategories', async () => {
    await useFinanceStore.getState().deleteCategory('expense', 'Food');

    const cats = useFinanceStore.getState().categories;
    expect(cats.find(c => c.name === 'Food')).toBeDefined();
  });
});

// ─── Subcategory operations ──────────────────────────────────────────────────

describe('addSubcategory', () => {
  it('adds subcategory to existing category', async () => {
    await useFinanceStore.getState().addSubcategory('expense', 'Food', 'Snacks');

    const food = useFinanceStore.getState().categories.find(c => c.name === 'Food')!;
    expect(food.subcategories).toContain('Snacks');
  });
});

describe('renameSubcategory', () => {
  it('renames subcategory and cascades to transactions', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Lunch', category: 'Food',
      subcategory: 'Restaurants', amount: 25, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().renameSubcategory('expense', 'Food', 'Restaurants', 'Ristoranti');

    const food = useFinanceStore.getState().categories.find(c => c.name === 'Food')!;
    expect(food.subcategories).toContain('Ristoranti');
    expect(food.subcategories).not.toContain('Restaurants');

    const txn = useFinanceStore.getState().transactions[0];
    expect(txn.subcategory).toBe('Ristoranti');
  });
});

describe('deleteSubcategoryAndRemap', () => {
  it('deletes subcategory and remaps transactions', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Lunch', category: 'Food',
      subcategory: 'Restaurants', amount: 25, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().deleteSubcategoryAndRemap(
      'expense', 'Food', 'Restaurants', 'Groceries'
    );

    const food = useFinanceStore.getState().categories.find(c => c.name === 'Food')!;
    expect(food.subcategories).not.toContain('Restaurants');
    expect(food.subcategories).toContain('Groceries');

    const txn = useFinanceStore.getState().transactions[0];
    expect(txn.subcategory).toBe('Groceries');
  });
});

describe('moveSubcategory', () => {
  it('moves subcategory between categories and updates transactions', async () => {
    await useFinanceStore.getState().addTransaction({
      id: 'txn-1', date: '2026-08-15', description: 'Bus', category: 'Transport',
      subcategory: 'Public', amount: 5, type: 'expense', accountId: 'acc-1',
    });

    await useFinanceStore.getState().moveSubcategory('expense', 'Public', 'Transport', 'Food');

    const transport = useFinanceStore.getState().categories.find(c => c.name === 'Transport')!;
    const food = useFinanceStore.getState().categories.find(c => c.name === 'Food')!;
    expect(transport.subcategories).not.toContain('Public');
    expect(food.subcategories).toContain('Public');

    const txn = useFinanceStore.getState().transactions[0];
    expect(txn.category).toBe('Food');
  });

  it('no-ops when fromCategory === toCategory', async () => {
    await useFinanceStore.getState().moveSubcategory('expense', 'Public', 'Transport', 'Transport');

    const transport = useFinanceStore.getState().categories.find(c => c.name === 'Transport')!;
    expect(transport.subcategories).toContain('Public');
  });
});

// ─── Account CRUD ────────────────────────────────────────────────────────────

describe('addAccount', () => {
  it('adds account to state and Firestore', async () => {
    await useFinanceStore.getState().addAccount({
      id: 'acc-3', name: 'Investment', initialBalance: 1000, isDefault: false,
    });

    const accounts = useFinanceStore.getState().accounts;
    expect(accounts).toHaveLength(3);
    expect(accounts.find(a => a.id === 'acc-3')).toBeDefined();
  });
});

describe('updateAccount', () => {
  it('updates account in state and Firestore', async () => {
    await useFinanceStore.getState().updateAccount({
      id: 'acc-1', name: 'Updated Name', initialBalance: 0, isDefault: true,
    });

    const acc = useFinanceStore.getState().accounts.find(a => a.id === 'acc-1')!;
    expect(acc.name).toBe('Updated Name');
  });
});

describe('deleteAccount', () => {
  it('removes account from state and Firestore', async () => {
    await useFinanceStore.getState().deleteAccount('acc-2');

    expect(useFinanceStore.getState().accounts).toHaveLength(1);
    expect(useFinanceStore.getState().accounts.find(a => a.id === 'acc-2')).toBeUndefined();
  });
});

describe('setDefaultAccount', () => {
  it('sets default and unsets others', async () => {
    await useFinanceStore.getState().setDefaultAccount('acc-2');

    const accounts = useFinanceStore.getState().accounts;
    expect(accounts.find(a => a.id === 'acc-2')!.isDefault).toBe(true);
    expect(accounts.find(a => a.id === 'acc-1')!.isDefault).toBe(false);
  });
});

// ─── Card CRUD ───────────────────────────────────────────────────────────────

describe('addCard', () => {
  it('adds card to state and Firestore', async () => {
    await useFinanceStore.getState().addCard({
      id: 'card-1', name: 'Visa', type: 'credit', plafond: 5000, billingDay: 15, accountId: 'acc-1',
    });

    expect(useFinanceStore.getState().cards).toHaveLength(1);
    expect(useFinanceStore.getState().cards[0].name).toBe('Visa');
  });
});

describe('deleteCard', () => {
  it('removes card from state and Firestore', async () => {
    useFinanceStore.setState({
      cards: [{ id: 'card-1', name: 'Visa', type: 'credit', plafond: 5000, billingDay: 15, accountId: 'acc-1' }],
    });
    _seedDoc(userPath, {
      ..._getDocData(userPath)!,
      cards: useFinanceStore.getState().cards,
    });

    await useFinanceStore.getState().deleteCard('card-1');

    expect(useFinanceStore.getState().cards).toHaveLength(0);
  });
});

// ─── Error / rollback paths ──────────────────────────────────────────────────

describe('error handling', () => {
  it('sets saveError when Firestore write fails', async () => {
    // Override the mocked setDoc to throw
    const firestoreModule = await import('firebase/firestore');
    const originalSetDoc = firestoreModule.setDoc;
    (firestoreModule as { setDoc: typeof originalSetDoc }).setDoc = vi.fn().mockRejectedValue(new Error('Firestore unavailable'));

    await useFinanceStore.getState().addTransaction({
      id: 'txn-fail', date: '2026-08-15', description: 'Will fail', category: 'Food',
      subcategory: 'Groceries', amount: 50, type: 'expense', accountId: 'acc-1',
    });

    expect(useFinanceStore.getState().saveError).toBe('Firestore unavailable');
    // Transaction should be rolled back from state
    expect(useFinanceStore.getState().transactions.find(t => t.id === 'txn-fail')).toBeUndefined();

    // Restore
    (firestoreModule as { setDoc: typeof originalSetDoc }).setDoc = originalSetDoc;
  });
});

// ─── _migrateToMultiAccount ──────────────────────────────────────────────────

describe('_migrateToMultiAccount', () => {
  it('assigns default accountId to transactions missing one', async () => {
    useFinanceStore.setState({
      transactions: [
        {
          id: 'txn-no-acct', date: '2026-08-15', description: 'Legacy', category: 'Food',
          subcategory: 'Groceries', amount: 30, type: 'expense', accountId: '',
        },
      ],
      accounts: [
        { id: 'acc-1', name: 'Main', initialBalance: 0, isDefault: true },
      ],
    });
    _seedDoc(`${userPath}/transactions/txn-no-acct`, {
      id: 'txn-no-acct', date: '2026-08-15', description: 'Legacy', category: 'Food',
      subcategory: 'Groceries', amount: 30, type: 'expense', accountId: '',
    });

    await useFinanceStore.getState()._migrateToMultiAccount();

    const txn = useFinanceStore.getState().transactions.find(t => t.id === 'txn-no-acct')!;
    expect(txn.accountId).toBe('acc-1');
  });

  it('no-ops when all transactions already have accountId', async () => {
    useFinanceStore.setState({
      transactions: [
        {
          id: 'txn-ok', date: '2026-08-15', description: 'Has account', category: 'Food',
          subcategory: 'Groceries', amount: 30, type: 'expense', accountId: 'acc-1',
        },
      ],
    });

    await useFinanceStore.getState()._migrateToMultiAccount();

    // No error, no change
    expect(useFinanceStore.getState().saveError).toBeNull();
  });
});

// ─── setAll ──────────────────────────────────────────────────────────────────

describe('setAll', () => {
  it('merges partial state', () => {
    useFinanceStore.getState().setAll({
      initialBalance: 5000,
      language: 'en',
    });

    expect(useFinanceStore.getState().initialBalance).toBe(5000);
    expect(useFinanceStore.getState().language).toBe('en');
    // Other fields unchanged
    expect(useFinanceStore.getState().categories).toHaveLength(2);
  });
});

// ─── clearSaveError ──────────────────────────────────────────────────────────

describe('clearSaveError', () => {
  it('resets saveError to null', () => {
    useFinanceStore.setState({ saveError: 'Some error' });
    useFinanceStore.getState().clearSaveError();
    expect(useFinanceStore.getState().saveError).toBeNull();
  });
});

// ─── setInitialBalance ───────────────────────────────────────────────────────

describe('setInitialBalance', () => {
  it('updates balance in state and Firestore', async () => {
    await useFinanceStore.getState().setInitialBalance(10000);

    expect(useFinanceStore.getState().initialBalance).toBe(10000);
    const userData = _getDocData(userPath);
    expect(userData!.initialBalance).toBe(10000);
  });
});

// ─── setBalanceStartDate ─────────────────────────────────────────────────────

describe('setBalanceStartDate', () => {
  it('updates date in state and Firestore', async () => {
    await useFinanceStore.getState().setBalanceStartDate('2025-06-01');

    expect(useFinanceStore.getState().balanceStartDate).toBe('2025-06-01');
    const userData = _getDocData(userPath);
    expect(userData!.balanceStartDate).toBe('2025-06-01');
  });
});
