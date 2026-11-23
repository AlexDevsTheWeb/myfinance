import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Category, Transaction } from '../../store/useFinanceStore';
import {
  aggregateUtilities,
  availableUtilityYears,
  buildSpendSeries,
  buildUtilityDuplicate,
  buildYearOverYearSeries,
  classifyUtility,
  effectiveUnitRate,
  resolveBillPreset,
  searchUtilityRows,
  selectUtilities,
  sortUtilityRows,
  splitBill,
  toUtilityRows,
  yoyPercent,
} from './utilities.utils';

const bill = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'bill-1',
  date: '2026-03-15',
  description: 'Bolletta luce',
  category: 'Bollette',
  subcategory: 'Elettricità',
  amount: 100,
  type: 'expense',
  accountId: 'acc-1',
  ...overrides,
});

const today = dayjs('2026-11-23T10:00:00');

describe('classifyUtility', () => {
  it('infers the utility from Italian and English subcategories', () => {
    expect(classifyUtility(bill())).toBe('electricity');
    expect(classifyUtility(bill({ category: 'Utilities', subcategory: 'Electricity' }))).toBe('electricity');
    expect(classifyUtility(bill({ subcategory: 'Gas' }))).toBe('gas');
    expect(classifyUtility(bill({ subcategory: 'Metano' }))).toBe('gas');
    expect(classifyUtility(bill({ category: 'Utilities', subcategory: 'Water' }))).toBe('water');
    expect(classifyUtility(bill({ subcategory: 'Acqua' }))).toBe('water');
  });

  it('prefers an explicit utilityType over the category keywords', () => {
    expect(classifyUtility(bill({ utilityType: 'water', subcategory: 'Gas' }))).toBe('water');
  });

  it('ignores non-metered bills and non-expenses', () => {
    expect(classifyUtility(bill({ subcategory: 'Telefono' }))).toBeNull();
    expect(classifyUtility(bill({ subcategory: 'Internet' }))).toBeNull();
    expect(classifyUtility(bill({ type: 'income' }))).toBeNull();
    expect(classifyUtility(bill({ category: 'Alimentari', subcategory: 'Spesa' }))).toBeNull();
  });
});

describe('selectUtilities', () => {
  const transactions = [
    bill({ id: 'a', date: '2026-01-10' }),
    bill({ id: 'b', date: '2025-12-10', subcategory: 'Gas' }),
    bill({ id: 'c', date: '2026-02-10', subcategory: 'Telefono' }),
    bill({ id: 'd', date: '2024-06-10', subcategory: 'Acqua' }),
  ];

  it('scopes by year', () => {
    expect(selectUtilities(transactions, 2026, 'all').map((transaction) => transaction.id)).toEqual(['a']);
  });

  it('scopes by utility type', () => {
    expect(selectUtilities(transactions, 'all', 'gas').map((transaction) => transaction.id)).toEqual(['b']);
    expect(selectUtilities(transactions, 'all', 'water').map((transaction) => transaction.id)).toEqual(['d']);
  });

  it('keeps every year when the period is all', () => {
    expect(selectUtilities(transactions, 'all', 'all')).toHaveLength(3);
  });
});

describe('availableUtilityYears', () => {
  it('lists years with bills, newest first, always including the current year', () => {
    const years = availableUtilityYears([bill({ date: '2024-01-01' })], today);
    expect(years).toEqual([2026, 2024]);
  });
});

describe('splitBill', () => {
  it('keeps both quotas when recorded', () => {
    expect(splitBill(bill({ fixedFee: 30, energyFee: 70 }))).toEqual({ fixed: 30, energy: 70 });
  });

  it('derives the energy quota from the total when only the fixed one is recorded', () => {
    expect(splitBill(bill({ amount: 100, fixedFee: 30 }))).toEqual({ fixed: 30, energy: 70 });
  });

  it('derives the fixed quota from the total when only the energy one is recorded', () => {
    expect(splitBill(bill({ amount: 100, energyFee: 70 }))).toEqual({ fixed: 30, energy: 70 });
  });

  it('treats a bill without a breakdown as pure energy', () => {
    expect(splitBill(bill({ amount: 100 }))).toEqual({ fixed: 0, energy: 100 });
  });
});

describe('aggregateUtilities', () => {
  it('sums spend and volume and computes the weighted unit rate', () => {
    const totals = aggregateUtilities([
      bill({ amount: 100, consumption: 200, fixedFee: 30, energyFee: 70 }),
      bill({ amount: 60, consumption: 100, fixedFee: 10, energyFee: 50 }),
    ]);

    expect(totals.spend).toBe(160);
    expect(totals.volume).toBe(300);
    expect(totals.count).toBe(2);
    expect(totals.unitRate).toBeCloseTo(160 / 300);
    expect(totals.fixedSharePercent).toBeCloseTo((40 / 160) * 100);
    expect(totals.splitCount).toBe(2);
  });

  it('reports no split when no bill recorded one, while still counting the spend', () => {
    const totals = aggregateUtilities([bill({ amount: 90 })]);
    expect(totals.fixedSharePercent).toBeNull();
    expect(totals.energy).toBe(0);
    expect(totals.spend).toBe(90);
  });

  it('reports no unit rate without volume data', () => {
    expect(aggregateUtilities([bill()]).unitRate).toBeNull();
  });

  it('returns zeros for an empty set', () => {
    expect(aggregateUtilities([])).toMatchObject({ spend: 0, volume: 0, count: 0, unitRate: null, fixedSharePercent: null });
  });
});

describe('effectiveUnitRate', () => {
  it('divides the amount by the recorded volume', () => {
    expect(effectiveUnitRate(bill({ amount: 90, consumption: 300 }))).toBeCloseTo(0.3);
  });

  it('returns null without a positive volume', () => {
    expect(effectiveUnitRate(bill())).toBeNull();
    expect(effectiveUnitRate(bill({ consumption: 0 }))).toBeNull();
  });
});

describe('yoyPercent', () => {
  it('computes the percentage change', () => {
    expect(yoyPercent(120, 100)).toBeCloseTo(20);
    expect(yoyPercent(80, 100)).toBeCloseTo(-20);
  });

  it('returns null when the previous period has no spend', () => {
    expect(yoyPercent(120, 0)).toBeNull();
  });
});

describe('buildSpendSeries', () => {
  it('always returns twelve month buckets for a concrete year', () => {
    const buckets = buildSpendSeries([bill({ date: '2026-03-15' })], 2026);
    expect(buckets).toHaveLength(12);
    expect(buckets[2].spend).toBe(100);
    expect(buckets[2].fixed).toBe(0);
    expect(buckets[2].energy).toBe(100);
    expect(buckets[0].spend).toBe(0);
  });

  it('groups by year when the period is all', () => {
    const buckets = buildSpendSeries(
      [bill({ date: '2024-03-15', amount: 50 }), bill({ date: '2026-03-15', amount: 100 })],
      'all',
    );
    expect(buckets.map((bucket) => bucket.year)).toEqual([2024, 2026]);
    expect(buckets[1].spend).toBe(100);
  });
});

describe('buildYearOverYearSeries', () => {
  it('lines up the same month across two years', () => {
    const points = buildYearOverYearSeries(
      [
        bill({ date: '2026-01-20', consumption: 120 }),
        bill({ date: '2025-01-20', consumption: 150 }),
        bill({ date: '2025-02-20', consumption: 90 }),
      ],
      2026,
    );

    expect(points[0]).toEqual({ month: 0, current: 120, previous: 150 });
    expect(points[1]).toEqual({ month: 1, current: 0, previous: 90 });
    expect(points[11]).toEqual({ month: 11, current: 0, previous: 0 });
  });
});

describe('toUtilityRows', () => {
  it('drops non-utility transactions and exposes the split', () => {
    const rows = toUtilityRows([
      bill({ id: 'a', fixedFee: 30, energyFee: 70, consumption: 200 }),
      bill({ id: 'b', subcategory: 'Telefono' }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe('electricity');
    expect(rows[0].hasSplit).toBe(true);
    expect(rows[0].unitRate).toBeCloseTo(0.5);
  });
});

describe('searchUtilityRows', () => {
  const rows = toUtilityRows([
    bill({ provider: 'Enel Energia', meterId: 'IT001E123' }),
    bill({ id: 'b', subcategory: 'Gas', provider: 'Plenitude', meterId: 'PDR-9' }),
  ]);

  it('matches supplier, meter and subcategory', () => {
    expect(searchUtilityRows(rows, 'enel')).toHaveLength(1);
    expect(searchUtilityRows(rows, 'pdr-9')).toHaveLength(1);
    expect(searchUtilityRows(rows, 'gas')).toHaveLength(1);
  });

  it('returns everything for a blank term', () => {
    expect(searchUtilityRows(rows, '   ')).toHaveLength(2);
  });
});

describe('sortUtilityRows', () => {
  const rows = toUtilityRows([
    bill({ id: 'a', date: '2026-01-10', amount: 50 }),
    bill({ id: 'b', date: '2026-03-10', amount: 120 }),
  ]);

  it('sorts by date descending', () => {
    expect(sortUtilityRows(rows, { field: 'date', direction: 'desc' }).map((row) => row.transaction.id)).toEqual(['b', 'a']);
  });

  it('sorts by amount ascending', () => {
    expect(sortUtilityRows(rows, { field: 'amount', direction: 'asc' }).map((row) => row.transaction.id)).toEqual(['a', 'b']);
  });
});

describe('buildUtilityDuplicate', () => {
  it('keeps the identification and clears the readings and quotas', () => {
    const copy = buildUtilityDuplicate(
      bill({
        utilityType: 'gas',
        provider: 'Plenitude',
        meterId: 'PDR-9',
        consumption: 99,
        readingDateStart: '2026-02-01',
        readingDateEnd: '2026-02-28',
        fixedFee: 12,
        energyFee: 88,
        cardId: 'card-1',
      }),
      today,
    );

    expect(copy.id).not.toBe('bill-1');
    expect(copy.date).toBe('2026-11-23');
    expect(copy.provider).toBe('Plenitude');
    expect(copy.meterId).toBe('PDR-9');
    expect(copy.utilityType).toBe('gas');
    expect(copy.cardId).toBe('card-1');
    expect(copy.consumption).toBeUndefined();
    expect(copy.readingDateStart).toBeUndefined();
    expect(copy.fixedFee).toBeUndefined();
    expect(copy.energyFee).toBeUndefined();
  });
});

describe('resolveBillPreset', () => {
  const categories: Category[] = [
    { name: 'Casa', subcategories: ['Mutuo'] },
    { name: 'Bollette', subcategories: ['Telefono', 'Elettricità', 'Gas'] },
  ];

  it('finds the bill category and the matching subcategory', () => {
    expect(resolveBillPreset(categories, 'electricity')).toEqual({ category: 'Bollette', subcategory: 'Elettricità' });
    expect(resolveBillPreset(categories, 'gas')).toEqual({ category: 'Bollette', subcategory: 'Gas' });
  });

  it('leaves the subcategory open when the filter mixes utilities or has no match', () => {
    expect(resolveBillPreset(categories, 'all')).toEqual({ category: 'Bollette', subcategory: '' });
    expect(resolveBillPreset(categories, 'water')).toEqual({ category: 'Bollette', subcategory: '' });
  });

  it('falls back to a category holding a utility subcategory, and to empty', () => {
    expect(resolveBillPreset([{ name: 'Casa', subcategories: ['Luce'] }], 'electricity')).toEqual({
      category: 'Casa',
      subcategory: 'Luce',
    });
    expect(resolveBillPreset([{ name: 'Casa', subcategories: ['Mutuo'] }], 'all')).toEqual({ category: '', subcategory: '' });
  });
});
