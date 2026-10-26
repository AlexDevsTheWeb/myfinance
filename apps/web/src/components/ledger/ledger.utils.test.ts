import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { RecurringTransaction } from '../../store/useFinanceStore';
import { monthlyRecurringCost, nextRecurringCharge, pageWindow, resolvePeriodRange } from './ledger.utils';

const today = dayjs('2026-10-26T10:00:00');

const recurring = (overrides: Partial<RecurringTransaction> = {}): RecurringTransaction => ({
  id: 'rec-1',
  description: 'Netflix',
  category: 'Svago',
  subcategory: 'Abbonamenti',
  amount: 12,
  type: 'expense',
  dayOfMonth: 15,
  accountId: 'acc-1',
  startDate: '2026-01-15',
  frequency: 'monthly',
  ...overrides,
});

describe('resolvePeriodRange', () => {
  it('covers the whole current month', () => {
    const [start, end] = resolvePeriodRange('month', null, null, today);
    expect(start.format('YYYY-MM-DD')).toBe('2026-10-01');
    expect(end.format('YYYY-MM-DD')).toBe('2026-10-31');
  });

  it('covers the last 90 days inclusive of today', () => {
    const [start, end] = resolvePeriodRange('90d', null, null, today);
    expect(start.format('YYYY-MM-DD')).toBe('2026-07-29');
    expect(end.format('YYYY-MM-DD')).toBe('2026-10-26');
    expect(end.diff(start, 'day')).toBe(89);
  });

  it('covers the calendar year', () => {
    const [start, end] = resolvePeriodRange('year', null, null, today);
    expect(start.format('YYYY-MM-DD')).toBe('2026-01-01');
    expect(end.format('YYYY-MM-DD')).toBe('2026-12-31');
  });

  it('uses the custom bounds when provided', () => {
    const [start, end] = resolvePeriodRange('custom', dayjs('2026-03-01'), dayjs('2026-04-15'), today);
    expect(start.format('YYYY-MM-DD')).toBe('2026-03-01');
    expect(end.format('YYYY-MM-DD')).toBe('2026-04-15');
  });

  it('falls back to year-to-date when custom bounds are empty', () => {
    const [start, end] = resolvePeriodRange('custom', null, null, today);
    expect(start.format('YYYY-MM-DD')).toBe('2026-01-01');
    expect(end.format('YYYY-MM-DD')).toBe('2026-10-26');
  });
});

describe('monthlyRecurringCost', () => {
  it('returns the amount for monthly charges', () => {
    expect(monthlyRecurringCost(recurring({ amount: 620 }))).toBe(620);
  });

  it('amortises yearly charges over twelve months', () => {
    expect(monthlyRecurringCost(recurring({ amount: 120, frequency: 'yearly' }))).toBeCloseTo(10);
  });
});

describe('nextRecurringCharge', () => {
  it('returns this month when the day has not passed', () => {
    const next = nextRecurringCharge(recurring({ dayOfMonth: 28 }), today);
    expect(next!.format('YYYY-MM-DD')).toBe('2026-10-28');
  });

  it('rolls to next month when the day has passed', () => {
    const next = nextRecurringCharge(recurring({ dayOfMonth: 15 }), today);
    expect(next!.format('YYYY-MM-DD')).toBe('2026-11-15');
  });

  it('returns null when the template has ended', () => {
    const next = nextRecurringCharge(recurring({ endDate: '2026-09-30' }), today);
    expect(next).toBeNull();
  });

  it('handles yearly templates', () => {
    const next = nextRecurringCharge(recurring({ frequency: 'yearly', monthOfYear: 3, dayOfMonth: 10 }), today);
    expect(next!.format('YYYY-MM-DD')).toBe('2027-03-10');
  });
});

describe('pageWindow', () => {
  it('lists every page when the count is small', () => {
    expect(pageWindow(0, 3)).toEqual([0, 1, 2]);
  });

  it('keeps first, last and neighbours with gaps in between', () => {
    expect(pageWindow(5, 20)).toEqual([0, 'gap', 4, 5, 6, 'gap', 19]);
  });

  it('does not duplicate the first page when current is next to it', () => {
    expect(pageWindow(1, 20)).toEqual([0, 1, 2, 'gap', 19]);
  });
});
