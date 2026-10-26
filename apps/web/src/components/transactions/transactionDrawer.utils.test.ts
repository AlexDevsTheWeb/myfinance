import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Account, Transaction } from '../../store/useFinanceStore';
import {
  buildRecurringTemplate,
  computeAccountBalance,
  DEFAULT_RECURRING_DRAFT,
  draftToTransaction,
  EMPTY_DRAFT,
  hasErrors,
  pricePerLitre,
  resolveUtilityUnit,
  showsReadingPeriod,
  transactionToDraft,
  validateDraft,
  type TransactionDraft,
} from './transactionDrawer.utils';

const draft = (overrides: Partial<TransactionDraft> = {}): TransactionDraft => ({
  ...EMPTY_DRAFT,
  description: 'Esselunga',
  category: 'Alimentari',
  subcategory: 'Spesa',
  amount: '42.5',
  accountId: 'acc-1',
  ...overrides,
});

const today = dayjs('2026-10-26T10:00:00');

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(hasErrors(validateDraft(draft()))).toBe(false);
  });

  it('requires amount, description, category, subcategory and account', () => {
    const errors = validateDraft({ ...EMPTY_DRAFT, amount: '0' });
    expect(Object.keys(errors).sort()).toEqual(['accountId', 'amount', 'category', 'description', 'subcategory']);
  });

  it('rejects a non-numeric amount', () => {
    expect(validateDraft(draft({ amount: 'abc' })).amount).toBeDefined();
  });
});

describe('resolveUtilityUnit', () => {
  it('detects electricity by category or subcategory, in both languages', () => {
    expect(resolveUtilityUnit('Utenze', 'Elettricità')).toBe('kWh');
    expect(resolveUtilityUnit('Utilities', 'Electricity')).toBe('kWh');
  });

  it('detects gas', () => {
    expect(resolveUtilityUnit('Utenze', 'Gas')).toBe('smc');
    expect(resolveUtilityUnit('Auto', 'Metano')).toBe('smc');
  });

  it('detects fuel', () => {
    expect(resolveUtilityUnit('Auto', 'Carburante')).toBe('L');
    expect(resolveUtilityUnit('Car', 'Diesel')).toBe('L');
  });

  it('returns null for ordinary categories', () => {
    expect(resolveUtilityUnit('Alimentari', 'Spesa')).toBeNull();
  });
});

describe('showsReadingPeriod', () => {
  it('is true only for metered utilities', () => {
    expect(showsReadingPeriod('kWh')).toBe(true);
    expect(showsReadingPeriod('smc')).toBe(true);
    expect(showsReadingPeriod('L')).toBe(false);
    expect(showsReadingPeriod(null)).toBe(false);
  });
});

describe('pricePerLitre', () => {
  it('derives the unit price from amount and litres', () => {
    expect(pricePerLitre(60, 40)).toBeCloseTo(1.5);
  });

  it('returns null for zero or invalid litres', () => {
    expect(pricePerLitre(60, 0)).toBeNull();
    expect(pricePerLitre(60, Number.NaN)).toBeNull();
  });
});

describe('computeAccountBalance', () => {
  const accounts: Account[] = [{ id: 'acc-1', name: 'ING', initialBalance: 1000, isDefault: true }];
  const transactions = [
    { id: 't1', date: '2026-10-01', description: 'Salary', category: 'X', subcategory: 'Y', amount: 500, type: 'income', accountId: 'acc-1' },
    { id: 't2', date: '2026-10-02', description: 'Rent', category: 'X', subcategory: 'Y', amount: 200, type: 'expense', accountId: 'acc-1' },
    { id: 't3', date: '2026-10-03', description: 'Move', category: 'X', subcategory: 'Y', amount: 300, type: 'transfer', accountId: 'acc-1' },
  ] as Transaction[];

  it('adds income and subtracts expenses, ignoring transfers', () => {
    expect(computeAccountBalance('acc-1', accounts, transactions)).toBe(1300);
  });

  it('returns null for an unknown account', () => {
    expect(computeAccountBalance('missing', accounts, transactions)).toBeNull();
  });
});

describe('buildRecurringTemplate', () => {
  it('starts on the first day of next month so today is not duplicated', () => {
    const template = buildRecurringTemplate({
      draft: draft(),
      recurring: { ...DEFAULT_RECURRING_DRAFT, enabled: true, dayOfMonth: 15 },
      type: 'expense',
      today,
    });

    expect(template.startDate).toBe('2026-11-01');
    expect(template.dayOfMonth).toBe(15);
    expect(template.frequency).toBe('monthly');
    expect(template.amount).toBe(42.5);
    expect(template.endDate).toBeNull();
    expect(template.monthOfYear).toBeUndefined();
  });

  it('clamps the charge day into 1..31', () => {
    const template = buildRecurringTemplate({
      draft: draft(),
      recurring: { ...DEFAULT_RECURRING_DRAFT, enabled: true, dayOfMonth: 45 },
      type: 'expense',
      today,
    });
    expect(template.dayOfMonth).toBe(31);
  });

  it('carries monthOfYear only for yearly templates', () => {
    const template = buildRecurringTemplate({
      draft: draft(),
      recurring: { ...DEFAULT_RECURRING_DRAFT, enabled: true, frequency: 'yearly', monthOfYear: 3 },
      type: 'expense',
      today,
    });
    expect(template.frequency).toBe('yearly');
    expect(template.monthOfYear).toBe(3);
  });

  it('keeps the card and an end date when provided', () => {
    const template = buildRecurringTemplate({
      draft: draft({ cardId: 'card-1' }),
      recurring: { ...DEFAULT_RECURRING_DRAFT, enabled: true, endDate: '2027-12-31' },
      type: 'expense',
      today,
    });
    expect(template.cardId).toBe('card-1');
    expect(template.endDate).toBe('2027-12-31');
  });
});

describe('draftToTransaction', () => {
  it('builds a transaction and coerces the amount', () => {
    const transaction = draftToTransaction(draft(), 'expense');
    expect(transaction.amount).toBe(42.5);
    expect(transaction.description).toBe('Esselunga');
    expect(transaction.cardId).toBeUndefined();
    expect(transaction.consumption).toBeUndefined();
  });

  it('parses consumption and reading dates when present', () => {
    const transaction = draftToTransaction(
      draft({ consumption: '120', readingDateStart: '2026-09-01', readingDateEnd: '2026-09-30' }),
      'expense',
    );
    expect(transaction.consumption).toBe(120);
    expect(transaction.readingDateStart).toBe('2026-09-01');
    expect(transaction.readingDateEnd).toBe('2026-09-30');
  });

  it('keeps the existing id when editing', () => {
    expect(draftToTransaction(draft(), 'expense', 'tx-1').id).toBe('tx-1');
  });
});

describe('transactionToDraft', () => {
  it('round-trips the editable fields', () => {
    const transaction: Transaction = {
      id: 'tx-1',
      date: '2026-10-20',
      description: 'Bolletta',
      category: 'Utenze',
      subcategory: 'Elettricità',
      amount: 88.4,
      type: 'expense',
      accountId: 'acc-1',
      cardId: 'card-1',
      consumption: 210,
      readingDateStart: '2026-09-01',
      readingDateEnd: '2026-09-30',
    };

    const restored = transactionToDraft(transaction);
    expect(restored).toMatchObject({
      date: '2026-10-20',
      description: 'Bolletta',
      amount: '88.4',
      accountId: 'acc-1',
      cardId: 'card-1',
      consumption: '210',
    });
  });
});
