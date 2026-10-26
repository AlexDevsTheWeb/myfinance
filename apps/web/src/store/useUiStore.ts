import dayjs from 'dayjs';
import { create } from 'zustand';
import type { Transaction } from './useFinanceStore';

export type TransactionDrawerType = 'income' | 'expense' | 'transfer';

interface UiState {
  /** Currently selected day in the dashboard calendar (YYYY-MM-DD). */
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  /** Global transaction drawer state so any surface (dashboard CTA, FAB, ledger) can open it. */
  txDrawerOpen: boolean;
  txDrawerType: TransactionDrawerType;
  txDrawerTransaction: Transaction | null;
  openTransactionDrawer: (type: TransactionDrawerType, transaction?: Transaction | null) => void;
  closeTransactionDrawer: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  selectedDate: dayjs().format('YYYY-MM-DD'),
  setSelectedDate: (date) => set({ selectedDate: date }),

  txDrawerOpen: false,
  txDrawerType: 'expense',
  txDrawerTransaction: null,
  openTransactionDrawer: (type, transaction = null) =>
    set({ txDrawerOpen: true, txDrawerType: type, txDrawerTransaction: transaction }),
  closeTransactionDrawer: () => set({ txDrawerOpen: false, txDrawerTransaction: null }),
}));
