import { vi, describe, it, expect } from 'vitest';

vi.mock('firebase/firestore', () => ({
  doc: () => ({ withConverter: (c: unknown) => c }),
  collection: () => ({ withConverter: (c: unknown) => c }),
  Timestamp: { now: () => ({ seconds: 0, nanoseconds: 0 }) },
}));

vi.mock('./firebase', () => ({ db: {} }));

import { userDocConverter, transactionConverter, recurringTransactionConverter } from './converters';

type Snapshot = { data: () => Record<string, unknown> };

const snap = (data: Record<string, unknown>) => ({ data: () => data }) as unknown as Snapshot;
const readUser = (data: Record<string, unknown>) =>
  userDocConverter.fromFirestore(snap(data) as never, {} as never);

describe('transactionConverter.fromFirestore', () => {
  it('maps a complete document unchanged', () => {
    const doc = {
      id: 't1',
      date: '2026-01-15',
      description: 'Grocery',
      category: 'Food',
      subcategory: 'Supermarket',
      amount: 42.5,
      type: 'expense',
      accountId: 'acc-1',
      recurringLinkId: 'rec-1',
      consumption: 12.3,
      cardId: 'card-1',
    };
    const out = transactionConverter.fromFirestore(snap(doc) as never, {} as never);
    expect(out).toMatchObject(doc);
  });

  it('coerces missing fields to defensive defaults', () => {
    const out = transactionConverter.fromFirestore(snap({}) as never, {} as never);
    expect(out.id).toBe('');
    expect(out.date).toBe('');
    expect(out.amount).toBe(0);
    expect(out.type).toBe('expense');
    expect(out.accountId).toBe('default-main');
  });

  it('rejects an unknown type value back to expense', () => {
    const out = transactionConverter.fromFirestore(
      snap({ type: 'bogus' }) as never,
      {} as never,
    );
    expect(out.type).toBe('expense');
  });

  it('converts a numeric string consumption to a number', () => {
    const out = transactionConverter.fromFirestore(
      snap({ consumption: '7.5' }) as never,
      {} as never,
    );
    expect(out.consumption).toBe(7.5);
  });

  it('leaves an empty-string consumption undefined', () => {
    const out = transactionConverter.fromFirestore(
      snap({ consumption: '' }) as never,
      {} as never,
    );
    expect(out.consumption).toBeUndefined();
  });

  it('drops a falsy cardId to undefined', () => {
    const out = transactionConverter.fromFirestore(snap({ cardId: '' }) as never, {} as never);
    expect(out.cardId).toBeUndefined();
  });
});

describe('recurringTransactionConverter.fromFirestore', () => {
  it('preserves a yearly frequency and its monthOfYear', () => {
    const out = recurringTransactionConverter.fromFirestore(
      snap({ id: 'r1', frequency: 'yearly', monthOfYear: 3 }) as never,
      {} as never,
    );
    expect(out.frequency).toBe('yearly');
    expect(out.monthOfYear).toBe(3);
  });

  it('falls back to monthly for an unknown frequency', () => {
    const out = recurringTransactionConverter.fromFirestore(
      snap({ frequency: 'weekly' }) as never,
      {} as never,
    );
    expect(out.frequency).toBe('monthly');
  });

  it('keeps monthOfYear even for a non-yearly frequency (asymmetric with toFirestore)', () => {
    const out = recurringTransactionConverter.fromFirestore(
      snap({ frequency: 'monthly', monthOfYear: 7 }) as never,
      {} as never,
    );
    expect(out.monthOfYear).toBe(7);
  });

  it('omits monthOfYear when absent or null', () => {
    expect(
      recurringTransactionConverter.fromFirestore(snap({}) as never, {} as never).monthOfYear,
    ).toBeUndefined();
    expect(
      recurringTransactionConverter.fromFirestore(
        snap({ monthOfYear: null }) as never,
        {} as never,
      ).monthOfYear,
    ).toBeUndefined();
  });

  it('does not write monthOfYear for a monthly frequency on the way out', () => {
    const written = recurringTransactionConverter.toFirestore({
      id: 'r1',
      description: 'Rent',
      category: 'Home',
      subcategory: 'Rent',
      amount: 800,
      type: 'expense',
      dayOfMonth: 1,
      accountId: 'a1',
      startDate: '2026-01-01',
      frequency: 'monthly',
      monthOfYear: 7,
    });
    expect(written).not.toHaveProperty('monthOfYear');
  });
});

describe('userDocConverter.fromFirestore — scalar defaults', () => {
  it('applies every documented default for an empty document', () => {
    const out = readUser({});
    expect(out.initialBalance).toBe(0);
    expect(out.categories).toEqual([]);
    expect(out.incomeCategories).toEqual([]);
    expect(out.accounts).toEqual([]);
    expect(out.cards).toEqual([]);
    expect(out.recurringTransactions).toEqual([]);
    expect(out.carMileage).toEqual([]);
    expect(out.carInitialMileage).toBe(0);
    expect(out.tireSettings).toEqual({
      summerModel: '',
      winterModel: '',
      initialTireType: 'summer',
    });
    expect(out.tireChanges).toEqual([]);
    expect(out.balanceStartDate).toBe('2026-01-01');
    expect(out.deletedRecurringInstances).toEqual([]);
    expect(out.etfTransactions).toEqual([]);
    expect(out.portfolioSnapshots).toEqual([]);
    expect(out.brokerAccounts).toEqual([]);
    expect(out.assetHoldings).toEqual([]);
    expect(out.cashAdjustments).toEqual([]);
    expect(out.dividendEntries).toEqual([]);
    expect(out.budgetTargets).toEqual([]);
    expect(out.brokerConfig).toBeUndefined();
  });

  it('defaults enabledModules with financeTracker on and the rest off', () => {
    const out = readUser({});
    expect(out.enabledModules).toEqual({
      financeTracker: true,
      carManagement: false,
      utilityTracker: false,
      investmentTracking: false,
      budgetTracking: false,
    });
  });

  it('preserves a fully-populated enabledModules', () => {
    const out = readUser({
      enabledModules: {
        financeTracker: false,
        carManagement: true,
        utilityTracker: true,
        investmentTracking: true,
        budgetTracking: true,
      },
    });
    expect(out.enabledModules.financeTracker).toBe(false);
    expect(out.enabledModules.budgetTracking).toBe(true);
  });
});

describe('userDocConverter.fromFirestore — nested collections', () => {
  it('maps categories and keeps only string subcategories', () => {
    const out = readUser({
      categories: [
        { name: 'Food', subcategories: ['Supermarket', 42, null, 'Bakery'] },
        { subcategories: 'not-an-array' },
      ],
    });
    expect(out.categories).toEqual([
      { name: 'Food', subcategories: ['Supermarket', 'Bakery'] },
      { name: '', subcategories: [] },
    ]);
  });

  it('maps incomeCategories the same way as categories', () => {
    const out = readUser({ incomeCategories: [{ name: 'Salary' }] });
    expect(out.incomeCategories).toEqual([{ name: 'Salary', subcategories: [] }]);
  });

  it('coerces account numbers and booleans', () => {
    const out = readUser({
      accounts: [
        { id: 'a1', name: 'Main', initialBalance: 100, isDefault: true },
        { id: 'a2', name: 'Bad', initialBalance: 'oops', isDefault: 'yes' },
      ],
    });
    expect(out.accounts).toEqual([
      { id: 'a1', name: 'Main', initialBalance: 100, isDefault: true },
      { id: 'a2', name: 'Bad', initialBalance: 0, isDefault: true },
    ]);
  });

  it('defaults a card type to credit and billingDay to 1', () => {
    const out = readUser({
      cards: [
        { id: 'c1', name: 'Visa', type: 'debit', plafond: 500, billingDay: 10, accountId: 'a1' },
        { id: 'c2', name: 'Unknown', type: 'weird' },
      ],
    });
    expect(out.cards).toEqual([
      { id: 'c1', name: 'Visa', type: 'debit', plafond: 500, billingDay: 10, accountId: 'a1' },
      { id: 'c2', name: 'Unknown', type: 'credit', plafond: 0, billingDay: 1, accountId: '' },
    ]);
  });

  it('narrows a recurring transaction type and defaults accountId', () => {
    const out = readUser({
      recurringTransactions: [
        { id: 'r1', type: 'transfer' },
        { id: 'r2', type: 'nonsense' },
      ],
    });
    expect(out.recurringTransactions[0].type).toBe('transfer');
    expect(out.recurringTransactions[0].accountId).toBe('default-main');
    expect(out.recurringTransactions[1].type).toBe('expense');
    expect(out.recurringTransactions[1].dayOfMonth).toBe(1);
  });

  it('falls back to document-level year/month for a mileage record', () => {
    const out = readUser({
      year: 2024,
      month: 7,
      carMileage: [
        { id: 'm1', reading: 1000 },
        { id: 'm2', year: 2020, month: 1, reading: 2000 },
      ],
    });
    expect(out.carMileage).toEqual([
      { id: 'm1', year: 2024, month: 7, reading: 1000 },
      { id: 'm2', year: 2020, month: 1, reading: 2000 },
    ]);
  });

  it('narrows a tire change type and defaults an invalid one to summer', () => {
    const out = readUser({
      tireChanges: [
        { id: 't1', type: 'winter', date: '2026-03-01', odometer: 5000 },
        { id: 't2', type: 'monsoon' },
      ],
    });
    expect(out.tireChanges[0].type).toBe('winter');
    expect(out.tireChanges[1].type).toBe('summer');
    expect(out.tireChanges[1].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('reads tire settings and defaults an unknown initial type to summer', () => {
    const out = readUser({
      tireSettings: { summerModel: 'Michelin', winterModel: 'Pirelli', initialTireType: 'nope' },
    });
    expect(out.tireSettings).toEqual({
      summerModel: 'Michelin',
      winterModel: 'Pirelli',
      initialTireType: 'summer',
    });
  });

  it('maps deleted recurring instances to linkId + date', () => {
    const out = readUser({
      deletedRecurringInstances: [{ recurringLinkId: 'r1', date: '2026-02-01' }, {}],
    });
    expect(out.deletedRecurringInstances).toEqual([
      { recurringLinkId: 'r1', date: '2026-02-01' },
      { recurringLinkId: '', date: '' },
    ]);
  });

  it('narrows an ETF transaction type and defaults it to buy', () => {
    const out = readUser({
      etfTransactions: [
        { id: 'e1', type: 'sell', units: 3, price: 10, totalAmount: 30 },
        { id: 'e2', type: 'swap' },
      ],
    });
    expect(out.etfTransactions[0]).toMatchObject({ type: 'sell', units: 3, totalAmount: 30 });
    expect(out.etfTransactions[1].type).toBe('buy');
  });

  it('maps nested portfolio snapshot holdings', () => {
    const out = readUser({
      portfolioSnapshots: [
        {
          id: 's1',
          date: '2026-01-31',
          totalInvested: 1000,
          currentValue: 1200,
          cashBalance: 50,
          accruedInterest: 5,
          holdings: [
            { ticker: 'VWCE', units: 10, avgCost: 90, currentPrice: 110, value: 1100, returnPercent: 22 },
            { ticker: 'BROKEN' },
          ],
        },
      ],
    });
    const snap0 = out.portfolioSnapshots[0];
    expect(snap0.currentValue).toBe(1200);
    expect(snap0.holdings).toEqual([
      { ticker: 'VWCE', units: 10, avgCost: 90, currentPrice: 110, value: 1100, returnPercent: 22 },
      { ticker: 'BROKEN', units: 0, avgCost: 0, currentPrice: 0, value: 0, returnPercent: 0 },
    ]);
  });

  it('defaults snapshot holdings to an empty array when absent', () => {
    const out = readUser({ portfolioSnapshots: [{ id: 's1' }] });
    expect(out.portfolioSnapshots[0].holdings).toEqual([]);
  });

  it('maps broker accounts', () => {
    const out = readUser({
      brokerAccounts: [
        { id: 'b1', name: 'Trade Republic', ticker: 'EUNL', baseLumpSum: 500, monthlyPacAmount: 250, interestRate: 2 },
        { id: 'b2' },
      ],
    });
    expect(out.brokerAccounts[0]).toEqual({
      id: 'b1',
      name: 'Trade Republic',
      ticker: 'EUNL',
      baseLumpSum: 500,
      monthlyPacAmount: 250,
      interestRate: 2,
    });
    expect(out.brokerAccounts[1]).toEqual({
      id: 'b2',
      name: '',
      ticker: '',
      baseLumpSum: 0,
      monthlyPacAmount: 0,
      interestRate: 0,
    });
  });

  it('maps asset holdings', () => {
    const out = readUser({
      assetHoldings: [{ ticker: 'VWCE', brokerId: 'b1', units: 12.5 }, { ticker: 'ORPHAN' }],
    });
    expect(out.assetHoldings).toEqual([
      { ticker: 'VWCE', brokerId: 'b1', units: 12.5 },
      { ticker: 'ORPHAN', brokerId: '', units: 0 },
    ]);
  });

  it('maps cash adjustments', () => {
    const out = readUser({
      cashAdjustments: [{ id: 'c1', brokerId: 'b1', amount: 100, date: '2026-01-05', notes: 'bonus' }, {}],
    });
    expect(out.cashAdjustments).toEqual([
      { id: 'c1', brokerId: 'b1', amount: 100, date: '2026-01-05', notes: 'bonus' },
      { id: '', brokerId: '', amount: 0, date: '', notes: undefined },
    ]);
  });

  it('narrows a dividend entry type and defaults it to dividend', () => {
    const out = readUser({
      dividendEntries: [
        { id: 'd1', type: 'interest', amount: 5, date: '2026-01-10' },
        { id: 'd2', type: 'unknown' },
      ],
    });
    expect(out.dividendEntries[0].type).toBe('interest');
    expect(out.dividendEntries[1].type).toBe('dividend');
  });

  it('narrows a budget target period and defaults a color', () => {
    const out = readUser({
      budgetTargets: [
        { id: 'bt1', category: 'Food', period: 'annual', targetAmount: 400 },
        { id: 'bt2', period: 'weekly', targetAmount: 'x', color: '#ff0000', name: 'Food budget' },
      ],
    });
    expect(out.budgetTargets[0]).toMatchObject({ period: 'annual', targetAmount: 400, color: '#6366f1' });
    expect(out.budgetTargets[1]).toMatchObject({ period: 'monthly', targetAmount: 0, color: '#ff0000' });
  });

  it('reads the legacy brokerConfig when present', () => {
    const out = readUser({
      brokerConfig: { brokerName: 'Degiro', lumpSumAmount: 300, monthlyPacAmount: 100, ticker: 'VWCE', interestRate: 3 },
    });
    expect(out.brokerConfig).toEqual({
      brokerName: 'Degiro',
      lumpSumAmount: 300,
      monthlyPacAmount: 100,
      ticker: 'VWCE',
      interestRate: 3,
    });
  });

  it('fills legacy brokerConfig defaults for a partial object', () => {
    const out = readUser({ brokerConfig: {} });
    expect(out.brokerConfig).toEqual({
      brokerName: 'Trade Republic',
      lumpSumAmount: 0,
      monthlyPacAmount: 0,
      ticker: 'EUNL',
      interestRate: 0,
    });
  });

  it('reads pacState with per-broker generation defaults', () => {
    const out = readUser({
      pacState: { lastGenerationDate: '2026-01-01', perBrokerLastGeneration: { b1: '2026-01-01' } },
    });
    expect(out.pacState).toEqual({
      lastGenerationDate: '2026-01-01',
      pendingTransaction: null,
      perBrokerLastGeneration: { b1: '2026-01-01' },
    });
  });

  it('ignores a non-array where a collection is expected', () => {
    const out = readUser({ categories: 'nope', accounts: 42, etfTransactions: {} });
    expect(out.categories).toEqual([]);
    expect(out.accounts).toEqual([]);
    expect(out.etfTransactions).toEqual([]);
  });
});

describe('userDocConverter.toFirestore', () => {
  it('round-trips a representative document', () => {
    const written = userDocConverter.toFirestore({
      initialBalance: 100,
      categories: [{ name: 'Food', subcategories: ['Supermarket'] }],
      incomeCategories: [],
      accounts: [{ id: 'a1', name: 'Main', initialBalance: 0, isDefault: true }],
      cards: [],
      recurringTransactions: [],
      carMileage: [],
      carInitialMileage: 0,
      tireSettings: { summerModel: '', winterModel: '', initialTireType: 'summer' },
      tireChanges: [],
      enabledModules: {
        financeTracker: true,
        carManagement: false,
        utilityTracker: false,
        investmentTracking: false,
        budgetTracking: false,
      },
      balanceStartDate: '2026-01-01',
      deletedRecurringInstances: [],
      etfTransactions: [],
      portfolioSnapshots: [],
      brokerAccounts: [],
      assetHoldings: [],
      cashAdjustments: [],
      dividendEntries: [],
      budgetTargets: [],
      pacState: { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
    });

    const reread = readUser(written as Record<string, unknown>);
    expect(reread.categories).toEqual([{ name: 'Food', subcategories: ['Supermarket'] }]);
    expect(reread.accounts).toEqual([{ id: 'a1', name: 'Main', initialBalance: 0, isDefault: true }]);
    expect(reread.initialBalance).toBe(100);
    expect(reread.balanceStartDate).toBe('2026-01-01');
  });
});
