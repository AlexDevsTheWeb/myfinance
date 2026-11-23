/**
 * Pure helpers for the Utilities & Consumption page.
 *
 * No React and no store access, so every rule (classification, aggregation,
 * Year-over-Year series, duplicate payload) is unit tested directly.
 */
import dayjs from 'dayjs';
import type { Category, Transaction, UtilityType } from '../../store/useFinanceStore';
import type { UtilitiesPeriod, UtilitiesSort, UtilitiesTypeFilter } from './types';

const BILL_CATEGORY_NAMES = ['bollette', 'bills', 'utenze', 'utilities'];

/** Subcategory keywords used to pre-select the utility in the drawer. */
const SUB_CATEGORY_HINTS: Record<UtilityType, string[]> = {
  electricity: ['elettric', 'luce', 'electric'],
  gas: ['gas', 'metano'],
  water: ['acqua', 'water', 'idrico'],
};

const ELECTRICITY = ['elettricità', 'elettricita', 'electricity', 'luce', 'energia'];
const GAS = ['gas', 'metano'];
const WATER = ['acqua', 'water', 'idrico', 'acquedotto'];

/**
 * Classify a transaction as a metered utility.
 *
 * An explicit `utilityType` always wins — it survives category renames. When it
 * is absent the kind is inferred from category and subcategory keywords, which
 * is how bills recorded before this page existed are picked up.
 */
export function classifyUtility(transaction: Transaction): UtilityType | null {
  if (transaction.type !== 'expense') return null;
  if (transaction.utilityType) return transaction.utilityType;

  const needle = `${transaction.category} ${transaction.subcategory}`.toLowerCase();
  if (WATER.some((term) => needle.includes(term))) return 'water';
  if (GAS.some((term) => needle.includes(term))) return 'gas';
  if (ELECTRICITY.some((term) => needle.includes(term))) return 'electricity';
  return null;
}

export function isUtilityTransaction(transaction: Transaction): boolean {
  return classifyUtility(transaction) !== null;
}

/**
 * Pick the bill category and a matching subcategory for the drawer preset.
 *
 * Users can rename categories, so this looks for the common bill names first
 * and falls back to any category holding a utility subcategory. An empty
 * category means "nothing matched": the drawer then leaves the choice open.
 */
export function resolveBillPreset(
  categories: Category[],
  typeFilter: UtilitiesTypeFilter,
): { category: string; subcategory: string } {
  const billCategory =
    categories.find((category) => BILL_CATEGORY_NAMES.includes(category.name.toLowerCase())) ??
    categories.find((category) =>
      category.subcategories.some((subcategory) =>
        SUB_CATEGORY_HINTS.electricity.concat(SUB_CATEGORY_HINTS.gas).some((hint) => subcategory.toLowerCase().includes(hint)),
      ),
    );

  if (!billCategory) return { category: '', subcategory: '' };
  if (typeFilter === 'all') return { category: billCategory.name, subcategory: '' };

  const hints = SUB_CATEGORY_HINTS[typeFilter];
  const subcategory = billCategory.subcategories.find((item) =>
    hints.some((hint) => item.toLowerCase().includes(hint)),
  );

  return { category: billCategory.name, subcategory: subcategory ?? '' };
}

/** Utility transactions, optionally narrowed to a year and a single utility. */
export function selectUtilities(
  transactions: Transaction[],
  period: UtilitiesPeriod,
  typeFilter: UtilitiesTypeFilter,
): Transaction[] {
  return transactions.filter((transaction) => {
    const type = classifyUtility(transaction);
    if (!type) return false;
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    if (period !== 'all' && dayjs(transaction.date).year() !== period) return false;
    return true;
  });
}

/** Distinct years that contain at least one utility bill, newest first. */
export function availableUtilityYears(transactions: Transaction[], today: dayjs.Dayjs = dayjs()): number[] {
  const years = new Set<number>();
  transactions.forEach((transaction) => {
    if (isUtilityTransaction(transaction)) years.add(dayjs(transaction.date).year());
  });
  years.add(today.year());
  return Array.from(years).sort((a, b) => b - a);
}

export interface FeeSplit {
  fixed: number;
  energy: number;
}

/** True when the bill carries at least one of the two quota fields. */
export function hasFeeBreakdown(transaction: Transaction): boolean {
  return typeof transaction.fixedFee === 'number' || typeof transaction.energyFee === 'number';
}

/**
 * Fixed/energy split of a single bill.
 *
 * When only one quota was recorded the other is derived from the total, so the
 * page never shows a split that contradicts the amount. Bills with no breakdown
 * count entirely as energy, which keeps the stacked total equal to the spend.
 */
export function splitBill(transaction: Transaction): FeeSplit {
  const { amount } = transaction;
  const fixed = typeof transaction.fixedFee === 'number' ? transaction.fixedFee : null;
  const energy = typeof transaction.energyFee === 'number' ? transaction.energyFee : null;

  if (fixed !== null && energy !== null) return { fixed, energy };
  if (fixed !== null) return { fixed, energy: Math.max(0, amount - fixed) };
  if (energy !== null) return { fixed: Math.max(0, amount - energy), energy };
  return { fixed: 0, energy: amount };
}

export interface UtilityTotals {
  spend: number;
  volume: number;
  count: number;
  /** Sum of the fixed quota over bills that recorded a breakdown. */
  fixed: number;
  /** Sum of the energy quota over bills that recorded a breakdown. */
  energy: number;
  /** Bills carrying an explicit breakdown — the denominator for the share. */
  splitCount: number;
  /** Fixed share of the recorded split, or null when no bill has one. */
  fixedSharePercent: number | null;
  /** Weighted average price per unit (spend / volume), or null without volume. */
  unitRate: number | null;
}

export function aggregateUtilities(transactions: Transaction[]): UtilityTotals {
  const totals = transactions.reduce<UtilityTotals>(
    (acc, transaction) => {
      acc.spend += transaction.amount;
      acc.volume += transaction.consumption ?? 0;
      acc.count += 1;
      if (hasFeeBreakdown(transaction)) {
        const split = splitBill(transaction);
        acc.fixed += split.fixed;
        acc.energy += split.energy;
        acc.splitCount += 1;
      }
      return acc;
    },
    { spend: 0, volume: 0, count: 0, fixed: 0, energy: 0, splitCount: 0, fixedSharePercent: null, unitRate: null },
  );

  const splitTotal = totals.fixed + totals.energy;
  totals.fixedSharePercent = totals.splitCount > 0 && splitTotal > 0 ? (totals.fixed / splitTotal) * 100 : null;
  totals.unitRate = totals.volume > 0 ? totals.spend / totals.volume : null;
  return totals;
}

/** Effective price per unit of a single bill, or null when the volume is missing. */
export function effectiveUnitRate(transaction: Transaction): number | null {
  const volume = transaction.consumption;
  if (!volume || volume <= 0) return null;
  return transaction.amount / volume;
}

/** Relative change against the previous period, or null when incomparable. */
export function yoyPercent(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface SpendBucket {
  /** `YYYY-MM` for monthly buckets, `YYYY` for the all-years view. */
  key: string;
  year: number;
  /** 0-11 for monthly buckets; null when one bucket represents a whole year. */
  month: number | null;
  spend: number;
  fixed: number;
  energy: number;
  volume: number;
}

/**
 * Bar-chart buckets.
 *
 * A concrete year yields twelve month buckets, including empty ones, so the
 * seasonal shape stays readable. `'all'` yields one bucket per year present in
 * the filtered set.
 */
export function buildSpendSeries(transactions: Transaction[], period: UtilitiesPeriod): SpendBucket[] {
  if (period === 'all') {
    const byYear = new Map<number, SpendBucket>();
    transactions.forEach((transaction) => {
      const year = dayjs(transaction.date).year();
      const bucket = byYear.get(year) ?? { key: String(year), year, month: null, spend: 0, fixed: 0, energy: 0, volume: 0 };
      const split = splitBill(transaction);
      bucket.spend += transaction.amount;
      bucket.fixed += split.fixed;
      bucket.energy += split.energy;
      bucket.volume += transaction.consumption ?? 0;
      byYear.set(year, bucket);
    });
    return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
  }

  const buckets: SpendBucket[] = Array.from({ length: 12 }, (_, month) => ({
    key: `${period}-${String(month + 1).padStart(2, '0')}`,
    year: period,
    month,
    spend: 0,
    fixed: 0,
    energy: 0,
    volume: 0,
  }));

  transactions.forEach((transaction) => {
    const date = dayjs(transaction.date);
    if (date.year() !== period) return;
    const bucket = buckets[date.month()];
    const split = splitBill(transaction);
    bucket.spend += transaction.amount;
    bucket.fixed += split.fixed;
    bucket.energy += split.energy;
    bucket.volume += transaction.consumption ?? 0;
  });

  return buckets;
}

export interface YearOverYearPoint {
  month: number;
  current: number;
  previous: number;
}

/**
 * Monthly physical consumption for a year and the year before.
 *
 * Callers pass bills already filtered to one utility type: comparing kWh with
 * SMC on the same axis would be meaningless.
 */
export function buildYearOverYearSeries(transactions: Transaction[], year: number): YearOverYearPoint[] {
  const points: YearOverYearPoint[] = Array.from({ length: 12 }, (_, month) => ({ month, current: 0, previous: 0 }));

  transactions.forEach((transaction) => {
    const date = dayjs(transaction.date);
    const month = date.month();
    const volume = transaction.consumption ?? 0;
    if (date.year() === year) points[month].current += volume;
    if (date.year() === year - 1) points[month].previous += volume;
  });

  return points;
}

export interface UtilityRow {
  transaction: Transaction;
  type: UtilityType;
  fixed: number;
  energy: number;
  hasSplit: boolean;
  unitRate: number | null;
}

/** Rich rows for the historical ledger. Non-utilities are dropped. */
export function toUtilityRows(transactions: Transaction[]): UtilityRow[] {
  return transactions.flatMap((transaction) => {
    const type = classifyUtility(transaction);
    if (!type) return [];
    return [
      {
        transaction,
        type,
        fixed: splitBill(transaction).fixed,
        energy: splitBill(transaction).energy,
        hasSplit: hasFeeBreakdown(transaction),
        unitRate: effectiveUnitRate(transaction),
      },
    ];
  });
}

export function searchUtilityRows(rows: UtilityRow[], term: string): UtilityRow[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter(({ transaction }) =>
    [transaction.description, transaction.provider ?? '', transaction.meterId ?? '', transaction.subcategory]
      .some((field) => field.toLowerCase().includes(needle)),
  );
}

export function sortUtilityRows(rows: UtilityRow[], sort: UtilitiesSort): UtilityRow[] {
  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (sort.field === 'amount') return (a.transaction.amount - b.transaction.amount) * direction;
    return (dayjs(a.transaction.date).valueOf() - dayjs(b.transaction.date).valueOf()) * direction;
  });
}

/**
 * Payload for the "duplicate" action.
 *
 * A duplicate is a template for the next bill: identification stays (supplier,
 * meter, utility kind) while the readings, the volume and the two quotas are
 * cleared, because they belong to the bill that was already paid.
 */
export function buildUtilityDuplicate(transaction: Transaction, today: dayjs.Dayjs = dayjs()): Transaction {
  return {
    id: crypto.randomUUID(),
    date: today.format('YYYY-MM-DD'),
    description: transaction.description,
    category: transaction.category,
    subcategory: transaction.subcategory,
    amount: transaction.amount,
    type: transaction.type,
    accountId: transaction.accountId,
    ...(transaction.cardId ? { cardId: transaction.cardId } : {}),
    ...(transaction.utilityType ? { utilityType: transaction.utilityType } : {}),
    ...(transaction.provider ? { provider: transaction.provider } : {}),
    ...(transaction.meterId ? { meterId: transaction.meterId } : {}),
  };
}
