import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Account, Transaction } from '../../store/useFinanceStore';
import {
  buildRecurringTemplate,
  formatAmountInput,
  parseAmountInput,
  computeAccountBalance,
  DEFAULT_RECURRING_DRAFT,
  draftToTransaction,
  EMPTY_DRAFT,
  hasErrors,
  parseOptionalAmount,
  pricePerLitre,
  resetDraftForType,
  resolveUtilityUnit,
  showsReadingPeriod,
  splitUtilityFees,
  transactionToDraft,
  utilityTypeForUnit,
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

describe('resetDraftForType', () => {  it('clears type-specific fields but keeps date and account', () => {
    const filled = draft({
      amount: '2.123,45',
      description: 'Esselunga',
      consumption: '12',
      readingDateStart: '2026-09-01',
      readingDateEnd: '2026-09-30',
      cardId: 'card-1',
    });

    const reset = resetDraftForType(filled);

    expect(reset.amount).toBe('');
    expect(reset.description).toBe('');
    expect(reset.category).toBe('');
    expect(reset.subcategory).toBe('');
    expect(reset.consumption).toBe('');
    expect(reset.readingDateStart).toBe('');
    expect(reset.readingDateEnd).toBe('');
    expect(reset.vehicleName).toBe('');
    expect(reset.vehicleType).toBe('');
    expect(reset.odometerKm).toBe('');
    expect(reset.liters).toBe('');
    expect(reset.pricePerLiter).toBe('');
    expect(reset.expenseType).toBe('');
    // Shared context survives the tab switch
    expect(reset.date).toBe(filled.date);
    expect(reset.accountId).toBe('acc-1');
    expect(reset.cardId).toBe('card-1');
  });

  it('does not mutate the original draft', () => {
    const filled = draft();
    const reset = resetDraftForType(filled);
    expect(filled.amount).toBe('42.5');
    expect(reset).not.toBe(filled);
  });
});

describe('formatAmountInput', () => {
  it('groups thousands with dots while typing', () => {
    expect(formatAmountInput('2123')).toBe('2.123');
    expect(formatAmountInput('1234567')).toBe('1.234.567');
  });

  it('normalises a decimal point to an Italian comma', () => {
    expect(formatAmountInput('42.5')).toBe('42,5');
    expect(formatAmountInput('2123.45')).toBe('2.123,45');
  });

  it('keeps a trailing comma so decimals stay typeable', () => {
    expect(formatAmountInput('1.234,')).toBe('1.234,');
    expect(formatAmountInput('0,')).toBe('0,');
  });

  it('caps decimals at two places', () => {
    expect(formatAmountInput('42,567')).toBe('42,56');
  });

  it('strips letters and stray characters', () => {
    expect(formatAmountInput('abc12x3')).toBe('123');
    expect(formatAmountInput('')).toBe('');
  });

  it('treats repeated dots as thousand separators', () => {
    expect(formatAmountInput('1.234.567')).toBe('1.234.567');
  });
});

describe('parseAmountInput', () => {
  it('reads Italian notation', () => {
    expect(parseAmountInput('2.123,45')).toBeCloseTo(2123.45);
    expect(parseAmountInput('620,00')).toBeCloseTo(620);
  });

  it('reads a single dot as a decimal separator', () => {
    expect(parseAmountInput('42.5')).toBeCloseTo(42.5);
  });

  it('reads grouped thousands without decimals', () => {
    expect(parseAmountInput('2.123')).toBeCloseTo(2123);
  });

  it('returns NaN for empty or invalid input', () => {
    expect(Number.isNaN(parseAmountInput(''))).toBe(true);
    expect(Number.isNaN(parseAmountInput('abc'))).toBe(true);
  });

  it('round-trips what formatAmountInput produces', () => {
    for (const raw of ['2123', '42.5', '1234567.89', '0,5']) {
      const formatted = formatAmountInput(raw);
      expect(parseAmountInput(formatted)).toBeCloseTo(parseAmountInput(raw));
    }
  });
});

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

  it('detects water', () => {
    expect(resolveUtilityUnit('Utenze', 'Acqua')).toBe('m³');
    expect(resolveUtilityUnit('Utilities', 'Water')).toBe('m³');
  });

  it('detects fuel', () => {
    expect(resolveUtilityUnit('Auto', 'Carburante')).toBe('L');
    expect(resolveUtilityUnit('Car', 'Diesel')).toBe('L');
  });

  it('returns null for ordinary categories', () => {
    expect(resolveUtilityUnit('Alimentari', 'Spesa')).toBeNull();
  });
});

describe('utilityTypeForUnit', () => {
  it('maps metered units to the persisted utility kind', () => {
    expect(utilityTypeForUnit('kWh')).toBe('electricity');
    expect(utilityTypeForUnit('smc')).toBe('gas');
    expect(utilityTypeForUnit('m³')).toBe('water');
  });

  it('does not treat fuel as a household utility', () => {
    expect(utilityTypeForUnit('L')).toBeNull();
    expect(utilityTypeForUnit(null)).toBeNull();
  });
});

describe('showsReadingPeriod', () => {
  it('is true only for metered utilities', () => {
    expect(showsReadingPeriod('kWh')).toBe(true);
    expect(showsReadingPeriod('smc')).toBe(true);
    expect(showsReadingPeriod('m³')).toBe(true);
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
      amount: '88,4',
      accountId: 'acc-1',
      cardId: 'card-1',
      consumption: '210',
    });
  });

  it('restores the utility quotas, supplier and meter', () => {
    const restored = transactionToDraft({
      id: 'tx-2',
      date: '2026-10-20',
      description: 'Bolletta gas',
      category: 'Bollette',
      subcategory: 'Gas',
      amount: 100,
      type: 'expense',
      accountId: 'acc-1',
      utilityType: 'gas',
      fixedFee: 30,
      energyFee: 70,
      provider: 'Plenitude',
      meterId: 'PDR-9',
    });

    expect(restored.fixedFee).toBe('30');
    expect(restored.energyFee).toBe('70');
    expect(restored.provider).toBe('Plenitude');
    expect(restored.meterId).toBe('PDR-9');
  });
});

describe('parseOptionalAmount', () => {
  it('distinguishes a blank field from zero', () => {
    expect(Number.isNaN(parseOptionalAmount(''))).toBe(true);
    expect(Number.isNaN(parseOptionalAmount('   '))).toBe(true);
    expect(parseOptionalAmount('0')).toBe(0);
    expect(parseOptionalAmount('1.234,50')).toBeCloseTo(1234.5);
  });
});

describe('splitUtilityFees', () => {
  it('returns null when neither quota is provided', () => {
    expect(splitUtilityFees(100, Number.NaN, Number.NaN)).toBeNull();
  });

  it('derives the missing quota from the total', () => {
    expect(splitUtilityFees(100, 30, Number.NaN)).toEqual({ fixedFee: 30, energyFee: 70 });
    expect(splitUtilityFees(100, Number.NaN, 70)).toEqual({ fixedFee: 30, energyFee: 70 });
  });

  it('keeps both quotas when provided and never goes negative', () => {
    expect(splitUtilityFees(100, 30, 70)).toEqual({ fixedFee: 30, energyFee: 70 });
    expect(splitUtilityFees(10, 30, Number.NaN)).toEqual({ fixedFee: 30, energyFee: 0 });
  });
});

describe('draftToTransaction utility fields', () => {
  it('persists the derived utility kind, the split and the identification', () => {
    const transaction = draftToTransaction(
      draft({
        category: 'Bollette',
        subcategory: 'Gas',
        consumption: '120',
        fixedFee: '12',
        provider: 'Plenitude',
        meterId: 'PDR-9',
      }),
      'expense',
    );

    expect(transaction.utilityType).toBe('gas');
    expect(transaction.fixedFee).toBe(12);
    expect(transaction.energyFee).toBeCloseTo(30.5);
    expect(transaction.provider).toBe('Plenitude');
    expect(transaction.meterId).toBe('PDR-9');
  });

  it('omits the utility fields for ordinary expenses', () => {
    const transaction = draftToTransaction(draft(), 'expense');
    expect(transaction.utilityType).toBeUndefined();
    expect(transaction.fixedFee).toBeUndefined();
    expect(transaction.energyFee).toBeUndefined();
    expect(transaction.provider).toBeUndefined();
    expect(transaction.meterId).toBeUndefined();
  });
});

describe('car expense mapping', () => {
  const carDraft = () =>
    draft({
      category: 'Trasporti',
      subcategory: 'Carburante',
      amount: '60',
      vehicleName: '  Peugeot 208 ',
      vehicleType: 'car',
      odometerKm: '10500',
      liters: '50',
    });

  it('persists the vehicle fields and infers the expense type', () => {
    const transaction = draftToTransaction(carDraft(), 'expense');

    expect(transaction.vehicleName).toBe('Peugeot 208');
    expect(transaction.vehicleType).toBe('car');
    expect(transaction.odometerKm).toBe(10500);
    expect(transaction.liters).toBe(50);
    expect(transaction.expenseType).toBe('fuel');
    expect(transaction.pricePerLiter).toBeCloseTo(1.2);
  });

  it('prefers an explicit price per litre over the derived one', () => {
    const transaction = draftToTransaction({ ...carDraft(), pricePerLiter: '1,299' }, 'expense');
    expect(transaction.pricePerLiter).toBeCloseTo(1.299);
  });

  it('omits the car fields for an ordinary expense', () => {
    const transaction = draftToTransaction({ ...draft(), vehicleName: '', liters: '', odometerKm: '' }, 'expense');
    expect(transaction.vehicleName).toBeUndefined();
    expect(transaction.vehicleType).toBeUndefined();
    expect(transaction.odometerKm).toBeUndefined();
    expect(transaction.liters).toBeUndefined();
    expect(transaction.pricePerLiter).toBeUndefined();
    expect(transaction.expenseType).toBeUndefined();
  });

  it('round-trips through transactionToDraft', () => {
    const transaction = draftToTransaction(carDraft(), 'expense');
    const back = transactionToDraft(transaction);
    expect(back.vehicleName).toBe('Peugeot 208');
    expect(back.vehicleType).toBe('car');
    expect(back.odometerKm).toBe('10500');
    expect(back.liters).toBe('50');
    expect(back.expenseType).toBe('fuel');
  });
});

describe('explicit no-type', () => {
  it('persists none instead of re-inferring fuel', () => {
    const transaction = draftToTransaction(
      { ...draft({ category: 'Trasporti', subcategory: 'Carburante' }), expenseType: 'none' },
      'expense',
    );
    expect(transaction.expenseType).toBe('none');
  });

  it('round-trips the explicit no-type', () => {
    const transaction = draftToTransaction(
      { ...draft({ category: 'Trasporti', subcategory: 'Carburante' }), expenseType: 'none' },
      'expense',
    );
    expect(transactionToDraft(transaction).expenseType).toBe('none');
  });
});
