import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import type { Transaction } from '../../store/useFinanceStore';
import {
  availableCarYears,
  buildCarRows,
  buildDistanceYoY,
  buildMonthlyBuckets,
  classifyCarExpense,
  computeCarTotals,
  inferCarExpenseType,
  isCarCategory,
  isCarTransaction,
  listVehicleOptions,
  odometerDeltas,
  percentChange,
  resolveCarPreset,
  selectCarTransactions,
  UNASSIGNED_VEHICLE,
} from './car.utils';

let seq = 0;
const tx = (over: Partial<Transaction> = {}): Transaction => ({
  id: over.id ?? `t${(seq += 1)}`,
  date: '2026-01-10',
  description: 'Fuel',
  category: 'Trasporti',
  subcategory: 'Carburante',
  amount: 50,
  type: 'expense',
  accountId: 'acc',
  ...over,
});

const main = (over: Partial<Transaction> = {}) => tx({ vehicleName: 'Peugeot 208', vehicleType: 'car', ...over });
const scooter = (over: Partial<Transaction> = {}) => tx({ vehicleName: 'Vespa', vehicleType: 'scooter', ...over });

describe('classification', () => {
  it('uses the explicit expense type when present', () => {
    expect(classifyCarExpense(tx({ expenseType: 'maintenance' }))).toBe('maintenance');
  });

  it('infers fuel, tax and maintenance from names', () => {
    expect(inferCarExpenseType('Trasporti', 'Carburante')).toBe('fuel');
    expect(inferCarExpenseType('Auto', 'Bollo')).toBe('tax');
    expect(inferCarExpenseType('Auto', 'Tagliando')).toBe('maintenance');
    expect(inferCarExpenseType('Casa', 'Spesa')).toBeNull();
  });

  it('treats vehicle categories as car expenses', () => {
    expect(isCarCategory('Trasporti', 'Carburante')).toBe(true);
    expect(isCarCategory('Casa', 'Manutenzione')).toBe(false);
    expect(isCarTransaction(tx())).toBe(true);
  });

  it('excludes income and utility bills even with shared words', () => {
    expect(isCarTransaction(tx({ type: 'income' }))).toBe(false);
    expect(isCarTransaction(tx({ category: 'Utenze', subcategory: 'Gas', utilityType: 'gas' }))).toBe(false);
    expect(isCarTransaction(tx({ category: 'Casa', subcategory: 'Spesa' }))).toBe(false);
  });

  it('accepts an expense that only carries a car field', () => {
    expect(isCarTransaction(tx({ category: 'Altro', subcategory: 'Varie', vehicleName: 'Van' }))).toBe(true);
    expect(isCarTransaction(tx({ category: 'Altro', subcategory: 'Varie', odometerKm: 1200 }))).toBe(true);
  });
});

describe('vehicles', () => {
  it('lists named vehicles and the unassigned bucket, most used first', () => {
    const options = listVehicleOptions([
      main(),
      main(),
      scooter(),
      tx({ vehicleName: undefined }),
    ]);
    expect(options.map((option) => option.name)).toEqual(['Peugeot 208', null, 'Vespa']);
    expect(options[0]).toMatchObject({ key: 'Peugeot 208', type: 'car', count: 2 });
    expect(options[1]).toMatchObject({ key: UNASSIGNED_VEHICLE, name: null, count: 1 });
  });

  it('filters by vehicle and period', () => {
    const transactions = [
      main({ date: '2026-01-01' }),
      main({ date: '2025-12-01' }),
      scooter(),
    ];
    expect(selectCarTransactions(transactions, { vehicle: 'Peugeot 208', period: 2026 })).toHaveLength(1);
    expect(selectCarTransactions(transactions, { vehicle: 'all', period: 2025 })).toHaveLength(1);
    expect(selectCarTransactions(transactions, { vehicle: UNASSIGNED_VEHICLE })).toHaveLength(0);
  });

  it('derives available years from actual car data', () => {
    expect(availableCarYears([main({ date: '2024-06-01' })], dayjs('2026-11-24'))).toEqual([2026, 2024]);
  });
});

describe('odometer deltas', () => {
  const transactions = [
    main({ id: 'm1', date: '2026-01-01', odometerKm: 10000 }),
    scooter({ id: 's1', date: '2026-01-15', odometerKm: 200 }),
    main({ id: 'm2', date: '2026-02-01', odometerKm: 10500 }),
    scooter({ id: 's2', date: '2026-02-15', odometerKm: 260 }),
    main({ id: 'm3', date: '2026-03-01', odometerKm: 10900 }),
  ];

  it('isolates each vehicle, so a scooter never pollutes the car', () => {
    const deltas = odometerDeltas(transactions);
    expect(deltas.get('m2')).toBe(500);
    expect(deltas.get('m3')).toBe(400);
    expect(deltas.get('s2')).toBe(60);
    expect(deltas.has('m1')).toBe(false);
    expect(deltas.has('s1')).toBe(false);
  });

  it('ignores a decreasing reading instead of producing negative distance', () => {
    const deltas = odometerDeltas([
      main({ id: 'a', date: '2026-01-01', odometerKm: 5000 }),
      main({ id: 'b', date: '2026-02-01', odometerKm: 4000 }),
    ]);
    expect(deltas.has('b')).toBe(false);
  });
});

describe('totals', () => {
  const transactions = [
    main({ id: 'm1', date: '2026-01-01', odometerKm: 10000, amount: 50, liters: 40 }),
    main({ id: 'm2', date: '2026-02-01', odometerKm: 10500, amount: 60, liters: 30 }),
    main({ id: 'm3', date: '2026-03-01', odometerKm: 10900, amount: 40, liters: 20 }),
    scooter({ id: 's1', date: '2026-01-15', odometerKm: 200, amount: 10, liters: 1 }),
    scooter({ id: 's2', date: '2026-02-15', odometerKm: 260, amount: 10, liters: 1 }),
  ];
  const deltas = odometerDeltas(transactions);

  it('keeps the main car and the scooter separate', () => {
    const car = computeCarTotals(transactions, deltas, { vehicle: 'Peugeot 208', period: 2026 });
    expect(car.spend).toBe(150);
    expect(car.fuelSpend).toBe(150);
    expect(car.distanceKm).toBe(900);
    expect(car.liters).toBe(90);
    expect(car.kmPerLiter).toBeCloseTo(10, 5);
    expect(car.costPerKm).toBeCloseTo(150 / 900, 5);
    expect(car.avgMonthlyKm).toBeCloseTo(450, 5);
    expect(car.entries).toBe(3);

    const vespa = computeCarTotals(transactions, deltas, { vehicle: 'Vespa', period: 2026 });
    expect(vespa.distanceKm).toBe(60);
    expect(vespa.spend).toBe(20);
    expect(vespa.kmPerLiter).toBeCloseTo(30, 5);
  });

  it('splits fuel from other spend and returns null ratios without distance', () => {
    const rows = [
      main({ id: 'f', date: '2026-01-01', odometerKm: 1000, amount: 50, liters: 30 }),
      main({ id: 's', date: '2026-02-01', odometerKm: 1300, amount: 100, description: 'Tagliando', subcategory: 'Tagliando', liters: undefined }),
    ];
    const withService = computeCarTotals(rows, odometerDeltas(rows), {
      vehicle: 'Peugeot 208',
      period: 2026,
    });
    expect(withService.fuelSpend).toBe(50);
    expect(withService.otherSpend).toBe(100);
    expect(withService.costPerKm).toBeCloseTo(150 / 300, 5);
    expect(withService.otherCostPerKm).toBeCloseTo(100 / 300, 5);

    const noDistance = computeCarTotals([main({ amount: 20, odometerKm: undefined })], new Map(), {});
    expect(noDistance.costPerKm).toBeNull();
    expect(noDistance.kmPerLiter).toBeNull();
  });
});

describe('series', () => {
  // A clean 2026 line: January is the baseline, February closes the first delta.
  const monthly = [
    main({ id: 'm1', date: '2026-01-01', odometerKm: 10000, amount: 50, liters: 40 }),
    main({ id: 'm2', date: '2026-02-01', odometerKm: 10500, amount: 60, liters: 50 }),
  ];
  const monthlyDeltas = odometerDeltas(monthly);

  // A separate vehicle line with a 2025 baseline, for the YoY comparison.
  const yoyTransactions = [
    main({ id: 'y1', date: '2025-02-01', odometerKm: 8000, amount: 40 }),
    main({ id: 'y2', date: '2025-03-01', odometerKm: 8400, amount: 45 }),
    main({ id: 'c1', date: '2026-01-01', odometerKm: 10000, amount: 50 }),
    main({ id: 'c2', date: '2026-02-01', odometerKm: 10500, amount: 60 }),
  ];
  const yoyDeltas = odometerDeltas(yoyTransactions);

  it('buckets spend, distance and cost per km by month', () => {
    const buckets = buildMonthlyBuckets(monthly, monthlyDeltas, 'Peugeot 208', 2026);
    expect(buckets).toHaveLength(12);
    expect(buckets[0]).toMatchObject({ fuelSpend: 50, distanceKm: 0, costPerKm: null });
    expect(buckets[1]).toMatchObject({ fuelSpend: 60, distanceKm: 500 });
    expect(buckets[1].costPerKm).toBeCloseTo(60 / 500, 5);
  });

  it('compares monthly distance with the previous year and keeps gaps null', () => {
    const yoy = buildDistanceYoY(yoyTransactions, yoyDeltas, 'Peugeot 208', 2026);
    expect(yoy[1]).toMatchObject({ month: 2, current: 500, previous: null });
    expect(yoy[0]).toMatchObject({ month: 1, current: 1600, previous: null });
    expect(yoy[2]).toMatchObject({ month: 3, current: null, previous: 400 });
  });

  it('builds table rows with km/L and price per litre', () => {
    const rows = buildCarRows(monthly, monthlyDeltas);
    const feb = rows.find((row) => row.transaction.id === 'm2');
    expect(feb).toMatchObject({ deltaKm: 500, kmPerLiter: 10 });
    expect(feb?.pricePerLiter).toBeCloseTo(60 / 50, 5);
    expect(rows[0].transaction.date >= rows[1].transaction.date).toBe(true);
  });

  it('computes percent change only from a positive baseline', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(50, 100)).toBe(-50);
    expect(percentChange(50, 0)).toBeNull();
  });
});

describe('preset', () => {
  it('picks the vehicle category and its fuel subcategory', () => {
    expect(
      resolveCarPreset([
        { name: 'Casa', subcategories: ['Manutenzione'] },
        { name: 'Trasporti', subcategories: ['Pedaggi', 'Carburante'] },
      ]),
    ).toEqual({ category: 'Trasporti', subcategory: 'Carburante' });
  });

  it('falls back to a fuel subcategory and then to an empty preset', () => {
    expect(
      resolveCarPreset([{ name: 'Spostamenti', subcategories: ['Benzina'] }]),
    ).toEqual({ category: 'Spostamenti', subcategory: 'Benzina' });
    expect(resolveCarPreset([{ name: 'Casa', subcategories: ['Spesa'] }])).toEqual({
      category: '',
      subcategory: '',
    });
  });
});
