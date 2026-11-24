import dayjs from 'dayjs';
import { create } from 'zustand';
import type { VehicleType } from './types';
import type { Transaction } from './useFinanceStore';

export type TransactionDrawerType = 'income' | 'expense' | 'transfer';

/** Pre-seeded values for a new transaction opened from a specific surface. */
export interface TransactionDrawerPreset {
  category?: string;
  subcategory?: string;
  /** Expand the utility block even before a meter unit resolves. */
  utility?: boolean;
  /** Expand the car block even before the category resolves to a vehicle. */
  car?: boolean;
  vehicleName?: string;
  vehicleType?: VehicleType;
}

interface UiState {
  /** Currently selected day in the dashboard calendar (YYYY-MM-DD). */
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  /** Global transaction drawer state so any surface (dashboard CTA, FAB, ledger) can open it. */
  txDrawerOpen: boolean;
  txDrawerType: TransactionDrawerType;
  txDrawerTransaction: Transaction | null;
  txDrawerPreset: TransactionDrawerPreset | null;
  openTransactionDrawer: (
    type: TransactionDrawerType,
    transaction?: Transaction | null,
    preset?: TransactionDrawerPreset | null,
  ) => void;
  closeTransactionDrawer: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  selectedDate: dayjs().format('YYYY-MM-DD'),
  setSelectedDate: (date) => set({ selectedDate: date }),

  txDrawerOpen: false,
  txDrawerType: 'expense',
  txDrawerTransaction: null,
  txDrawerPreset: null,
  openTransactionDrawer: (type, transaction = null, preset = null) =>
    set({ txDrawerOpen: true, txDrawerType: type, txDrawerTransaction: transaction, txDrawerPreset: preset }),
  closeTransactionDrawer: () => set({ txDrawerOpen: false, txDrawerTransaction: null, txDrawerPreset: null }),
}));
