/** Pure helpers for the transaction ledger — no React, no store access. */
import dayjs, { type Dayjs } from 'dayjs';
import type { RecurringTransaction } from '../../store/useFinanceStore';
import type { LedgerPeriod } from './types';

/** Resolve the [start, end] window for the selected period. */
export function resolvePeriodRange(
  period: LedgerPeriod,
  customStart: Dayjs | null,
  customEnd: Dayjs | null,
  today: Dayjs = dayjs(),
): [Dayjs, Dayjs] {
  switch (period) {
    case '90d':
      return [today.subtract(89, 'day').startOf('day'), today.endOf('day')];
    case 'year':
      return [today.startOf('year'), today.endOf('year')];
    case 'custom':
      return [(customStart ?? today.startOf('year')).startOf('day'), (customEnd ?? today).endOf('day')];
    case 'month':
    default:
      return [today.startOf('month'), today.endOf('month')];
  }
}

/** Monthly-equivalent cost of a recurring template (yearly charges amortised). */
export function monthlyRecurringCost(recurring: RecurringTransaction): number {
  return recurring.frequency === 'yearly' ? recurring.amount / 12 : recurring.amount;
}

/** Next charge date for an active recurring expense, or null when it has ended. */
export function nextRecurringCharge(recurring: RecurringTransaction, today: Dayjs = dayjs()): Dayjs | null {
  if (recurring.endDate && dayjs(recurring.endDate).isBefore(today, 'day')) return null;

  if (recurring.frequency === 'yearly') {
    const month = (recurring.monthOfYear ?? dayjs(recurring.startDate).month() + 1) - 1;
    const candidate = today.month(month).date(recurring.dayOfMonth).startOf('day');
    return candidate.isBefore(today, 'day') ? candidate.add(1, 'year') : candidate;
  }

  const candidate = today.date(recurring.dayOfMonth).startOf('day');
  return candidate.isBefore(today, 'day') ? candidate.add(1, 'month') : candidate;
}

/** Windowed page numbers: 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(current: number, count: number): (number | 'gap')[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index);

  const pages = new Set<number>([0, count - 1, current]);
  if (current - 1 >= 0) pages.add(current - 1);
  if (current + 1 < count) pages.add(current + 1);

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push('gap');
    result.push(page);
  });
  return result;
}
