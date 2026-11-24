import dayjs from 'dayjs';
import type { Category, Transaction } from '../../store/useFinanceStore';
import type { CarExpenseType, VehicleType } from '../../store/types';

/**
 * Pure helpers for the car & fleet page.
 *
 * Kept free of React and store access so the arithmetic can be unit tested.
 * The governing rule is **strict per-vehicle isolation**: odometer deltas are
 * only ever computed between two readings of the same vehicle, so a rental or
 * a scooter can never move the main car's distance, efficiency or €/km.
 */

/** Synthetic key for expenses that have no `vehicleName` yet. */
export const UNASSIGNED_VEHICLE = '__unassigned__';

export type CarPeriod = number | 'all';
/** `all`, a vehicle name, or `UNASSIGNED_VEHICLE`. */
export type CarVehicleFilter = 'all' | string;

export interface VehicleOption {
  key: string;
  /** `null` for the unassigned bucket. */
  name: string | null;
  type: VehicleType;
  count: number;
}

export interface CarRow {
  transaction: Transaction;
  expenseType: CarExpenseType | null;
  vehicleKey: string;
  vehicleName: string | null;
  vehicleType: VehicleType;
  /** km driven since the previous reading of the same vehicle, or null. */
  deltaKm: number | null;
  /** Real km/L for a fuel row with both a delta and litres, or null. */
  kmPerLiter: number | null;
  pricePerLiter: number | null;
}

export interface CarTotals {
  spend: number;
  fuelSpend: number;
  otherSpend: number;
  distanceKm: number;
  liters: number;
  kmPerLiter: number | null;
  costPerKm: number | null;
  fuelCostPerKm: number | null;
  otherCostPerKm: number | null;
  avgMonthlyKm: number | null;
  monthsWithDistance: number;
  entries: number;
}

export interface CarBucket {
  /** 1–12. */
  month: number;
  fuelSpend: number;
  otherSpend: number;
  distanceKm: number;
  liters: number;
  costPerKm: number | null;
}

export interface CarYoYPoint {
  month: number;
  current: number | null;
  previous: number | null;
}

const FUEL_WORDS = ['carburante', 'benzina', 'gasolio', 'diesel', 'fuel', 'rifornimento', 'petrol', 'metano'];
const TAX_WORDS = ['bollo', 'assicurazione', 'tassa', 'tax', 'insurance'];
const MAINTENANCE_WORDS = ['tagliando', 'manutenzione', 'riparazione', 'service', 'gomme', 'pneumatici', 'tires', 'tyres', 'revisione', 'meccanico'];
const VEHICLE_WORDS = [
  'trasporti',
  'transport',
  'auto',
  'car',
  'veicolo',
  'vehicle',
  'moto',
  'scooter',
  'fleet',
  'flotta',
  'carburante',
  'benzina',
  'gasolio',
  'diesel',
  'fuel',
  'rifornimento',
];

const CAR_CATEGORY_NAMES = ['trasporti', 'transport', 'auto', 'car', 'veicolo', 'vehicle', 'moto', 'fleet', 'flotta'];

const hasWord = (needle: string, words: string[]): boolean => words.some((word) => needle.includes(word));

/** Classify a car expense from names alone. Explicit `expenseType` wins elsewhere. */
export function inferCarExpenseType(
  category: string,
  subcategory: string,
  description = '',
): CarExpenseType | null {
  const needle = `${category} ${subcategory} ${description}`.toLowerCase();
  if (hasWord(needle, FUEL_WORDS)) return 'fuel';
  if (hasWord(needle, TAX_WORDS)) return 'tax';
  if (hasWord(needle, MAINTENANCE_WORDS)) return 'maintenance';
  return null;
}

/** True when the category/subcategory names a vehicle expense. */
export function isCarCategory(category: string, subcategory: string): boolean {
  return hasWord(`${category} ${subcategory}`.toLowerCase(), VEHICLE_WORDS);
}

/**
 * A car expense is any expense that carries a car field, or whose category is
 * a vehicle category. Utility bills are explicitly excluded even when their
 * category happens to contain a shared word.
 */
export function isCarTransaction(transaction: Transaction): boolean {
  if (transaction.type !== 'expense') return false;
  if (transaction.utilityType) return false;
  if (
    transaction.vehicleName ||
    transaction.vehicleType ||
    transaction.expenseType !== undefined ||
    transaction.odometerKm !== undefined ||
    transaction.liters !== undefined ||
    transaction.pricePerLiter !== undefined
  ) {
    return true;
  }
  return isCarCategory(transaction.category, transaction.subcategory);
}

/** Explicit kind first, then category keywords. */
export function classifyCarExpense(transaction: Transaction): CarExpenseType | null {
  if (!isCarTransaction(transaction)) return null;
  if (transaction.expenseType) return transaction.expenseType;
  return inferCarExpenseType(transaction.category, transaction.subcategory, transaction.description);
}

export function vehicleKeyOf(transaction: Transaction): string {
  const name = transaction.vehicleName?.trim();
  return name ? name : UNASSIGNED_VEHICLE;
}

export function vehicleTypeOf(transaction: Transaction): VehicleType {
  return transaction.vehicleType ?? 'car';
}

/** Distinct vehicles present in the data, most-used first. */
export function listVehicleOptions(transactions: Transaction[]): VehicleOption[] {
  const map = new Map<string, VehicleOption>();
  for (const transaction of transactions) {
    if (!isCarTransaction(transaction)) continue;
    const key = vehicleKeyOf(transaction);
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        key,
        name: key === UNASSIGNED_VEHICLE ? null : key,
        type: vehicleTypeOf(transaction),
        count: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count || (a.name ?? '').localeCompare(b.name ?? ''));
}

export function availableCarYears(transactions: Transaction[], today: dayjs.Dayjs = dayjs()): number[] {
  const years = new Set<number>([today.year()]);
  for (const transaction of transactions) {
    if (isCarTransaction(transaction)) years.add(dayjs(transaction.date).year());
  }
  return Array.from(years).sort((a, b) => b - a);
}

/** Latest year that actually has car data, falling back to the current year. */
export function latestCarYear(transactions: Transaction[], today: dayjs.Dayjs = dayjs()): number {
  const years = availableCarYears(transactions, today);
  return years[0] ?? today.year();
}

export interface CarSelection {
  vehicle?: CarVehicleFilter;
  period?: CarPeriod;
}

export function selectCarTransactions(transactions: Transaction[], selection: CarSelection = {}): Transaction[] {
  const { vehicle = 'all', period = 'all' } = selection;
  return transactions.filter((transaction) => {
    if (!isCarTransaction(transaction)) return false;
    if (vehicle !== 'all') {
      const key = vehicleKeyOf(transaction);
      if (vehicle === UNASSIGNED_VEHICLE ? key !== UNASSIGNED_VEHICLE : key !== vehicle) return false;
    }
    if (period !== 'all' && dayjs(transaction.date).year() !== period) return false;
    return true;
  });
}

/**
 * Distance between consecutive odometer readings, **per vehicle**.
 *
 * The first reading of a vehicle is a baseline and yields no distance; a
 * decreasing reading (odometer reset, typo) is ignored rather than producing a
 * negative distance. The delta is attributed to the later transaction, so a
 * fill records the km driven since the previous fill.
 */
export function odometerDeltas(transactions: Transaction[]): Map<string, number> {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    if (!isCarTransaction(transaction)) continue;
    if (typeof transaction.odometerKm !== 'number' || !Number.isFinite(transaction.odometerKm)) continue;
    const key = vehicleKeyOf(transaction);
    const list = groups.get(key);
    if (list) list.push(transaction);
    else groups.set(key, [transaction]);
  }

  const deltas = new Map<string, number>();
  for (const list of groups.values()) {
    const sorted = [...list].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.odometerKm ?? 0) - (b.odometerKm ?? 0) ||
        a.id.localeCompare(b.id),
    );
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1].odometerKm ?? 0;
      const current = sorted[index].odometerKm ?? 0;
      const delta = current - previous;
      if (delta > 0) deltas.set(sorted[index].id, delta);
    }
  }
  return deltas;
}

/** Table rows, newest first, with derived km/L and €/L. */
export function buildCarRows(
  transactions: Transaction[],
  deltas: Map<string, number> = odometerDeltas(transactions),
): CarRow[] {
  return transactions
    .filter(isCarTransaction)
    .map((transaction) => {
      const expenseType = classifyCarExpense(transaction);
      const deltaKm = deltas.get(transaction.id) ?? null;
      const liters = transaction.liters;
      const amount = Math.abs(transaction.amount);
      const kmPerLiter =
        expenseType === 'fuel' && deltaKm !== null && typeof liters === 'number' && liters > 0
          ? deltaKm / liters
          : null;
      const pricePerLiter =
        transaction.pricePerLiter ??
        (typeof liters === 'number' && liters > 0 ? amount / liters : null);
      return {
        transaction,
        expenseType,
        vehicleKey: vehicleKeyOf(transaction),
        vehicleName: transaction.vehicleName?.trim() || null,
        vehicleType: vehicleTypeOf(transaction),
        deltaKm,
        kmPerLiter,
        pricePerLiter,
      };
    })
    .sort((a, b) => b.transaction.date.localeCompare(a.transaction.date) || a.transaction.id.localeCompare(b.transaction.id));
}

export function computeCarTotals(
  transactions: Transaction[],
  deltas: Map<string, number>,
  selection: CarSelection = {},
): CarTotals {
  const rows = selectCarTransactions(transactions, selection);
  let spend = 0;
  let fuelSpend = 0;
  let liters = 0;
  let distanceKm = 0;
  const months = new Set<string>();

  for (const transaction of rows) {
    const amount = Math.abs(transaction.amount);
    spend += amount;
    if (classifyCarExpense(transaction) === 'fuel') {
      fuelSpend += amount;
      if (typeof transaction.liters === 'number' && Number.isFinite(transaction.liters) && transaction.liters > 0) {
        liters += transaction.liters;
      }
    }
    const delta = deltas.get(transaction.id);
    if (delta !== undefined) {
      distanceKm += delta;
      months.add(dayjs(transaction.date).format('YYYY-MM'));
    }
  }

  const otherSpend = spend - fuelSpend;
  const monthsWithDistance = months.size;

  return {
    spend,
    fuelSpend,
    otherSpend,
    distanceKm,
    liters,
    kmPerLiter: distanceKm > 0 && liters > 0 ? distanceKm / liters : null,
    costPerKm: distanceKm > 0 ? spend / distanceKm : null,
    fuelCostPerKm: distanceKm > 0 ? fuelSpend / distanceKm : null,
    otherCostPerKm: distanceKm > 0 ? otherSpend / distanceKm : null,
    avgMonthlyKm: monthsWithDistance > 0 ? distanceKm / monthsWithDistance : null,
    monthsWithDistance,
    entries: rows.length,
  };
}

/** Twelve monthly buckets for the spend-vs-€/km chart. */
export function buildMonthlyBuckets(
  transactions: Transaction[],
  deltas: Map<string, number>,
  vehicle: CarVehicleFilter,
  year: number,
): CarBucket[] {
  const buckets: CarBucket[] = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    fuelSpend: 0,
    otherSpend: 0,
    distanceKm: 0,
    liters: 0,
    costPerKm: null,
  }));

  const rows = selectCarTransactions(transactions, { vehicle, period: year });
  for (const transaction of rows) {
    const bucket = buckets[dayjs(transaction.date).month()];
    const amount = Math.abs(transaction.amount);
    if (classifyCarExpense(transaction) === 'fuel') {
      bucket.fuelSpend += amount;
      if (typeof transaction.liters === 'number' && Number.isFinite(transaction.liters) && transaction.liters > 0) {
        bucket.liters += transaction.liters;
      }
    } else {
      bucket.otherSpend += amount;
    }
    const delta = deltas.get(transaction.id);
    if (delta !== undefined) bucket.distanceKm += delta;
  }

  for (const bucket of buckets) {
    const spend = bucket.fuelSpend + bucket.otherSpend;
    bucket.costPerKm = bucket.distanceKm > 0 ? spend / bucket.distanceKm : null;
  }
  return buckets;
}

/** Monthly distance for a year and the one before it. */
export function buildDistanceYoY(
  transactions: Transaction[],
  deltas: Map<string, number>,
  vehicle: CarVehicleFilter,
  year: number,
): CarYoYPoint[] {
  const points: CarYoYPoint[] = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    current: null,
    previous: null,
  }));

  for (const transaction of selectCarTransactions(transactions, { vehicle, period: 'all' })) {
    const txYear = dayjs(transaction.date).year();
    const isCurrent = txYear === year;
    const isPrevious = txYear === year - 1;
    if (!isCurrent && !isPrevious) continue;

    const month = dayjs(transaction.date).month();
    const delta = deltas.get(transaction.id);
    const side = isCurrent ? 'current' : 'previous';

    // A baseline reading proves the month has data but no known distance, so it
    // stays null (a gap) instead of pretending the vehicle drove 0 km.
    if (delta !== undefined) {
      points[month][side] = (points[month][side] ?? 0) + delta;
    }
  }

  return points;
}

/** Percentage change, or null when the previous value cannot be a baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Pick the category/subcategory the drawer should preseed on `/car`.
 *
 * Mirrors `resolveBillPreset`: look for common vehicle category names, then a
 * fuel subcategory. An empty result means "nothing matched" and the drawer
 * leaves the choice open.
 */
export function resolveCarPreset(categories: Category[]): { category: string; subcategory: string } {
  const category =
    categories.find((item) => CAR_CATEGORY_NAMES.some((word) => item.name.toLowerCase().includes(word))) ??
    categories.find((item) => item.subcategories.some((sub) => hasWord(sub.toLowerCase(), FUEL_WORDS)));

  if (!category) return { category: '', subcategory: '' };

  const subcategory = category.subcategories.find((sub) => hasWord(sub.toLowerCase(), FUEL_WORDS));
  return { category: category.name, subcategory: subcategory ?? '' };
}
