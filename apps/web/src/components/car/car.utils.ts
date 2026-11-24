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
  /** Litres, from `liters` or the legacy fuel `consumption` field. */
  liters: number | null;
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
  /** `YYYY-MM` keys used for the monthly average. */
  months: string[];
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

/** Shape of the legacy mileage log persisted on the user document. */
export interface CarMileageReading {
  year: number;
  month: number;
  reading: number;
  /** Absent for records written before the car page learned about vehicles. */
  vehicleName?: string;
}

/** One month of distance derived from the legacy mileage log. */
export interface LegacyMileagePoint {
  year: number;
  month: number;
  distanceKm: number;
}

const FUEL_WORDS = ['carburante', 'benzina', 'gasolio', 'diesel', 'fuel', 'rifornimento', 'petrol', 'metano'];
const TAX_WORDS = ['bollo', 'assicurazione', 'tassa', 'tax', 'insurance'];
const MAINTENANCE_WORDS = [
  'tagliando',
  'manutenzione',
  'riparazione',
  'service',
  'gomme',
  'pneumatici',
  'tires',
  'tyres',
  'revisione',
  'meccanico',
  'parcheggio',
  'parking',
  'pedaggio',
  'pedaggi',
  'toll',
  'lavaggio',
  'car wash',
  'multa',
  'sosta',
  'noleggio',
  'rental',
];
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

/**
 * Public transport is travel, not a cost of owning a vehicle. These rows live in
 * the same "Trasporti" category as fuel, so the category alone cannot decide.
 */
const PUBLIC_TRANSPORT_RE = new RegExp(
  String.raw`\b(?:` +
    [
      'trasporto pubblico',
      'trasporti pubblici',
      'mezzi pubblici',
      'treno',
      'treni',
      'ferrovia',
      'metro',
      'metropolitana',
      'autobus',
      'pullman',
      'tram',
      'bus',
      'aereo',
      'aerei',
      'volo',
      'voli',
      'taxi',
      'uber',
      'abbonamento',
      'abbonamenti',
      'traghetto',
      'traghetti',
      'ferry',
      'snav',
      'italo',
      'trenitalia',
      'biglietto',
      'biglietti',
    ].join('|') +
    String.raw`)\b`,
  'i',
);

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

/** True for a public transport / travel expense (train, metro, bus, flight, taxi…). */
export function isPublicTransport(category: string, subcategory: string, description = ''): boolean {
  return PUBLIC_TRANSPORT_RE.test(`${category} ${subcategory} ${description}`);
}

/**
 * A car expense needs a car-specific signal.
 *
 * `Trasporti` alone is too broad: train and metro tickets live there too. The
 * order matters:
 *
 * 1. income, utility bills and public transport are never vehicle costs;
 * 2. a strong car field (odometer, litres, €/L, explicit expense type) wins;
 * 3. an explicit vehicle tag wins;
 * 4. legacy fallback: a vehicle category **and** a car-expense keyword (fuel,
 *    maintenance, tax, parking, toll, rental).
 *
 * Public transport is excluded even when the `/car` preset auto-set
 * `vehicleType: 'car'`, because that preset is not a decision to count a ticket
 * as a vehicle cost. A row with a real odometer/litre reading still wins.
 */
export function isCarTransaction(transaction: Transaction): boolean {
  if (transaction.type !== 'expense') return false;
  if (transaction.utilityType) return false;

  const strongCarFields =
    (transaction.expenseType !== undefined && transaction.expenseType !== 'none') ||
    transaction.odometerKm !== undefined ||
    transaction.liters !== undefined ||
    transaction.pricePerLiter !== undefined;

  if (isPublicTransport(transaction.category, transaction.subcategory, transaction.description)) {
    return strongCarFields;
  }

  if (strongCarFields || transaction.vehicleName || transaction.vehicleType) return true;

  return (
    isCarCategory(transaction.category, transaction.subcategory) &&
    inferCarExpenseType(transaction.category, transaction.subcategory) !== null
  );
}

/** Explicit kind first, then category keywords. `none` suppresses inference. */
export function classifyCarExpense(transaction: Transaction): CarExpenseType | null {
  if (!isCarTransaction(transaction)) return null;
  if (transaction.expenseType === 'none') return null;
  if (transaction.expenseType) return transaction.expenseType;
  return inferCarExpenseType(transaction.category, transaction.subcategory, transaction.description);
}

/**
 * Litres on a fuel row.
 *
 * `liters` is the new dedicated field. Before it existed, the drawer stored the
 * fuel volume in `consumption` (unit `L`), so old fuel rows must keep counting.
 */
export function fuelLitersOf(transaction: Transaction): number | null {
  if (classifyCarExpense(transaction) !== 'fuel') return null;

  const explicit = transaction.liters;
  if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) return explicit;

  const legacy = transaction.consumption;
  if (typeof legacy === 'number' && Number.isFinite(legacy) && legacy > 0) return legacy;

  return null;
}

export function vehicleKeyOf(transaction: Transaction): string {
  const name = transaction.vehicleName?.trim();
  return name ? name : UNASSIGNED_VEHICLE;
}

export function vehicleTypeOf(transaction: Transaction): VehicleType {
  return transaction.vehicleType ?? 'car';
}

/** Distinct vehicles present in the data, most-used first. */
export function listVehicleOptions(
  transactions: Transaction[],
  mileage: CarMileageReading[] = [],
): VehicleOption[] {
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

  // A vehicle may exist only in the manual log (no expense tagged yet). It must
  // still be selectable, otherwise its readings cannot be inspected.
  for (const record of mileage) {
    const name = record.vehicleName?.trim();
    if (!name || map.has(name)) continue;
    map.set(name, { key: name, name, type: 'car', count: 0 });
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count || (a.name ?? '').localeCompare(b.name ?? ''));
}

/**
 * The main vehicle.
 *
 * The manual mileage log predates the vehicle field, so its untagged records
 * are attributed to the most-used car (or, failing that, the most-used named
 * vehicle). This is what lets a user who selected "Peugeot 3008" see the km
 * they recorded before transactions carried odometers.
 */
export function primaryVehicle(transactions: Transaction[], mileage: CarMileageReading[] = []): string | null {
  const named = listVehicleOptions(transactions, mileage).filter((option) => option.name !== null);
  if (named.length === 0) return null;
  return (named.find((option) => option.type === 'car') ?? named[0]).name;
}

/**
 * Mileage records that belong to the selected scope.
 *
 * `all` and the primary vehicle include untagged records; a tagged vehicle only
 * gets its own. `Unassigned` gets the untagged records only. This prevents a
 * tagged rental's log from leaking into another vehicle's distance.
 */
export function mileageForScope(
  mileage: CarMileageReading[],
  vehicle: CarVehicleFilter,
  primary: string | null,
): CarMileageReading[] {
  const nameOf = (record: CarMileageReading): string => record.vehicleName?.trim() ?? '';

  if (vehicle === 'all') {
    return mileage.filter((record) => !nameOf(record) || nameOf(record) === primary);
  }
  if (vehicle === UNASSIGNED_VEHICLE) {
    return mileage.filter((record) => !nameOf(record));
  }
  return mileage.filter(
    (record) => nameOf(record) === vehicle || (!nameOf(record) && vehicle === primary),
  );
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
  const years = transactions
    .filter(isCarTransaction)
    .map((transaction) => dayjs(transaction.date).year());
  return years.length > 0 ? Math.max(...years) : today.year();
}

/**
 * Latest year with either transaction-level or manual-log data.
 *
 * This is the default period: a user whose last fuel fill was in 2025 should
 * not land on an empty 2026 page just because the calendar moved on.
 */
export function latestCarDataYear(
  transactions: Transaction[],
  mileage: CarMileageReading[],
  today: dayjs.Dayjs = dayjs(),
): number {
  const years = [
    ...transactions.filter(isCarTransaction).map((transaction) => dayjs(transaction.date).year()),
    ...mileage.map((record) => record.year),
  ];
  return years.length > 0 ? Math.max(...years) : today.year();
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
      const liters = fuelLitersOf(transaction);
      const amount = Math.abs(transaction.amount);
      const kmPerLiter =
        expenseType === 'fuel' && deltaKm !== null && liters !== null ? deltaKm / liters : null;
      const pricePerLiter =
        transaction.pricePerLiter ??
        (liters !== null ? amount / liters : null);
      return {
        transaction,
        expenseType,
        vehicleKey: vehicleKeyOf(transaction),
        vehicleName: transaction.vehicleName?.trim() || null,
        vehicleType: vehicleTypeOf(transaction),
        deltaKm,
        liters,
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
    const isFuel = classifyCarExpense(transaction) === 'fuel';
    if (isFuel) {
      fuelSpend += amount;
      const rowLiters = fuelLitersOf(transaction);
      if (rowLiters !== null) liters += rowLiters;
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
    months: Array.from(months).sort(),
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
      const rowLiters = fuelLitersOf(transaction);
      if (rowLiters !== null) bucket.liters += rowLiters;
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

/* ------------------------------------------------------------------ *
 * Legacy mileage log
 *
 * Before the per-transaction odometer fields existed, the app stored one
 * reading per month in `carMileage` on the user document. That log is the only
 * distance source for existing accounts, so the page falls back to it when the
 * selected scope has no transaction-level odometer deltas.
 * ------------------------------------------------------------------ */

/** Monthly distance derived from the manual mileage log, oldest first. */
export function legacyMileageSeries(
  mileage: CarMileageReading[],
  initialMileage: number,
): LegacyMileagePoint[] {
  const sorted = [...mileage].sort(
    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
  );
  // An unset initial mileage (0) is "unknown", not "the car started at zero":
  // otherwise the first reading would be counted as tens of thousands of km.
  let previous: number | null = Number.isFinite(initialMileage) && initialMileage > 0 ? initialMileage : null;
  const points: LegacyMileagePoint[] = [];

  for (const record of sorted) {
    const reading = Number(record.reading);
    if (!Number.isFinite(reading)) continue;
    if (previous !== null) {
      const delta = reading - previous;
      if (delta > 0) points.push({ year: record.year, month: record.month, distanceKm: delta });
    }
    // A decreasing reading is ignored, but still becomes the next baseline.
    previous = reading;
  }

  return points;
}

const legacyMonthKey = (point: LegacyMileagePoint): string =>
  `${point.year}-${String(point.month).padStart(2, '0')}`;

/** Distance and distinct months from the legacy log for a period. */
export function legacyDistanceFor(
  points: LegacyMileagePoint[],
  period: CarPeriod,
): { distanceKm: number; months: string[] } {
  const selected = period === 'all' ? points : points.filter((point) => point.year === period);
  return {
    distanceKm: selected.reduce((sum, point) => sum + point.distanceKm, 0),
    months: Array.from(new Set(selected.map(legacyMonthKey))).sort(),
  };
}

/** Overlay legacy distance on transaction-based buckets, keeping their spend. */
export function applyLegacyDistance(
  buckets: CarBucket[],
  points: LegacyMileagePoint[],
  year: number,
): CarBucket[] {
  const byMonth = new Map<number, number>();
  for (const point of points) {
    if (point.year !== year) continue;
    byMonth.set(point.month, (byMonth.get(point.month) ?? 0) + point.distanceKm);
  }

  return buckets.map((bucket) => {
    const distanceKm = bucket.distanceKm + (byMonth.get(bucket.month) ?? 0);
    const spend = bucket.fuelSpend + bucket.otherSpend;
    return {
      ...bucket,
      distanceKm,
      costPerKm: distanceKm > 0 ? spend / distanceKm : null,
    };
  });
}

/** Monthly distance for a year and the one before, from the legacy log. */
export function legacyDistanceYoY(points: LegacyMileagePoint[], year: number): CarYoYPoint[] {
  const series: CarYoYPoint[] = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    current: null,
    previous: null,
  }));

  for (const point of points) {
    const month = series[point.month - 1];
    if (!month) continue;
    if (point.year === year) month.current = (month.current ?? 0) + point.distanceKm;
    else if (point.year === year - 1) month.previous = (month.previous ?? 0) + point.distanceKm;
  }

  return series;
}

/** Add a legacy series on top of a transaction series, keeping true gaps null. */
export function mergeYoY(base: CarYoYPoint[], extra: CarYoYPoint[]): CarYoYPoint[] {
  const combine = (a: number | null, b: number | null): number | null =>
    a === null && b === null ? null : (a ?? 0) + (b ?? 0);

  return base.map((point, index) => ({
    month: point.month,
    current: combine(point.current, extra[index]?.current ?? null),
    previous: combine(point.previous, extra[index]?.previous ?? null),
  }));
}

/** Replace the distance and recompute every ratio that depends on it. */
export function withDistance(totals: CarTotals, distanceKm: number, months: string[]): CarTotals {
  return {
    ...totals,
    distanceKm,
    months,
    monthsWithDistance: months.length,
    costPerKm: distanceKm > 0 ? totals.spend / distanceKm : null,
    fuelCostPerKm: distanceKm > 0 ? totals.fuelSpend / distanceKm : null,
    otherCostPerKm: distanceKm > 0 ? totals.otherSpend / distanceKm : null,
    kmPerLiter: distanceKm > 0 && totals.liters > 0 ? distanceKm / totals.liters : null,
    avgMonthlyKm: months.length > 0 ? distanceKm / months.length : null,
  };
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
