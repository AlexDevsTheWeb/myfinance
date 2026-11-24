import type { CarExpenseType, VehicleType } from '../../store/types';

/** Chart accents, aligned with the Executive Dark theme tokens. */
export const CAR_COLORS = {
  fuel: '#F59E0B',
  other: '#64748B',
  rate: '#06B6D4',
  distance: '#10B981',
  previous: '#475569',
} as const;

export const VEHICLE_COLORS: Record<VehicleType, string> = {
  car: '#06B6D4',
  scooter: '#10B981',
  rental: '#F59E0B',
  other: '#94A3B8',
};

export const EXPENSE_COLORS: Record<CarExpenseType, string> = {
  fuel: '#F59E0B',
  maintenance: '#94A3B8',
  tax: '#EF4444',
};

export type CarSortField = 'date' | 'amount' | 'odometer';
export interface CarSort {
  field: CarSortField;
  direction: 'asc' | 'desc';
}

export type CarExpenseFilter = 'all' | CarExpenseType;

export const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
