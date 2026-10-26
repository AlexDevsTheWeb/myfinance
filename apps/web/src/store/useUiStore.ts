import dayjs from 'dayjs';
import { create } from 'zustand';
import type { Transaction } from './useFinanceStore';

export type TransactionModalType = 'income' | 'expense';

interface UiState {
  /** Currently selected day in the dashboard calendar (YYYY-MM-DD). */
  selectedDate: string;
  setSelectedDate: (date: string) => void;

  /** Global transaction modal state so any surface (TopBar, FAB) can open it. */
  txModalOpen: boolean;
  txModalType: TransactionModalType;
  txModalTransaction: Transaction | null;
  openTransactionModal: (type: TransactionModalType, transaction?: Transaction | null) => void;
  closeTransactionModal: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  selectedDate: dayjs().format('YYYY-MM-DD'),
  setSelectedDate: (date) => set({ selectedDate: date }),

  txModalOpen: false,
  txModalType: 'expense',
  txModalTransaction: null,
  openTransactionModal: (type, transaction = null) =>
    set({ txModalOpen: true, txModalType: type, txModalTransaction: transaction }),
  closeTransactionModal: () => set({ txModalOpen: false, txModalTransaction: null }),
}));
