import dayjs from 'dayjs';
import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import type { IBrokerConfig, IETFTransaction, IPortfolioSnapshot, IInvestmentHolding } from './types';
import { validateEtfTransaction, validateBrokerConfig } from './validation';
import { sanitizeEtfTransaction, sanitizeBrokerConfig } from './sanitization';
import * as Defaults from './defaults';

export interface InvestmentState {
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerConfig: IBrokerConfig;
  currentPrice: number | null;
  lastPriceUpdate: string | null;
  isSaving: boolean;
  saveError: string | null;

  addEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  updateEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  deleteEtfTransaction: (id: string) => Promise<void>;
  setBrokerConfig: (config: IBrokerConfig) => Promise<void>;
  addPortfolioSnapshot: (snapshot: IPortfolioSnapshot) => Promise<void>;
  setCurrentPrice: (price: number) => void;
  setAll: (data: Partial<InvestmentState>) => void;
  clearSaveError: () => void;
}

export function calcAccruedInterest(cashBalance: number, annualRate: number): number {
  return cashBalance * (annualRate / 100) / 12;
}

function computeSnapshot(etfTxs: IETFTransaction[], currentPrice: number | null): Omit<IPortfolioSnapshot, 'id' | 'date'> {
  let totalInvested = 0;
  const holdingsMap = new Map<string, { units: number; totalCost: number }>();

  for (const tx of etfTxs) {
    if (tx.type === 'buy') {
      totalInvested += tx.totalAmount;
      const existing = holdingsMap.get(tx.ticker) || { units: 0, totalCost: 0 };
      holdingsMap.set(tx.ticker, {
        units: existing.units + tx.units,
        totalCost: existing.totalCost + tx.totalAmount,
      });
    } else {
      totalInvested -= tx.totalAmount;
      const existing = holdingsMap.get(tx.ticker) || { units: 0, totalCost: 0 };
      const sellRatio = tx.units / existing.units;
      holdingsMap.set(tx.ticker, {
        units: existing.units - tx.units,
        totalCost: existing.totalCost * (1 - sellRatio),
      });
    }
  }

  const holdings: IInvestmentHolding[] = [];
  let currentValue = 0;

  for (const [ticker, h] of holdingsMap.entries()) {
    const avgCost = h.units > 0 ? h.totalCost / h.units : 0;
    const price = currentPrice ?? avgCost;
    const value = h.units * price;
    currentValue += value;
    holdings.push({
      ticker,
      units: h.units,
      avgCost,
      currentPrice: price,
      value,
      returnPercent: avgCost > 0 ? ((value - h.totalCost) / h.totalCost) * 100 : 0,
    });
  }

  return { totalInvested, currentValue, cashBalance: 0, accruedInterest: 0, holdings };
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
  etfTransactions: [],
  portfolioSnapshots: [],
  brokerConfig: Defaults.DEFAULT_BROKER_CONFIG,
  currentPrice: null,
  lastPriceUpdate: null,
  isSaving: false,
  saveError: null,

  addEtfTransaction: async (tx) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateEtfTransaction(tx);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      const prevTxs = get().etfTransactions;
      const sorted = [tx, ...prevTxs].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
      set({ etfTransactions: sorted, isSaving: false });

      const docRef = doc(db, 'users', userId);
      const sanitizedTxs = useInvestmentStore.getState().etfTransactions.map(sanitizeEtfTransaction);
      await updateDoc(docRef, { etfTransactions: sanitizedTxs });

      const computed = computeSnapshot(useInvestmentStore.getState().etfTransactions, get().currentPrice);
      const snapshot: IPortfolioSnapshot = {
        id: crypto.randomUUID(),
        date: tx.date,
        ...computed,
      };
      const prevSnapshots = get().portfolioSnapshots;
      set({ portfolioSnapshots: [...prevSnapshots, snapshot] });
      const sanitizedSnapshots = useInvestmentStore.getState().portfolioSnapshots.map(s => ({
        id: s.id,
        date: s.date,
        totalInvested: s.totalInvested,
        currentValue: s.currentValue,
        cashBalance: s.cashBalance,
        accruedInterest: s.accruedInterest,
        holdings: s.holdings,
      }));
      await updateDoc(docRef, { portfolioSnapshots: sanitizedSnapshots });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add ETF transaction';
      set((state) => {
        const reverted = state.etfTransactions.filter(t => t.id !== tx.id);
        return { saveError: errorMessage, isSaving: false, etfTransactions: reverted };
      });
      console.error('addEtfTransaction error:', err);
    }
  },

  updateEtfTransaction: async (tx) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateEtfTransaction(tx);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state) => {
        const updated = state.etfTransactions.map(t => (t.id === tx.id ? tx : t));
        const sorted = updated.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
        return { etfTransactions: sorted, isSaving: false };
      });

      const docRef = doc(db, 'users', userId);
      const sanitizedTxs = useInvestmentStore.getState().etfTransactions.map(sanitizeEtfTransaction);
      await updateDoc(docRef, { etfTransactions: sanitizedTxs });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ETF transaction';
      set({ saveError: errorMessage, isSaving: false });
      console.error('updateEtfTransaction error:', err);
    }
  },

  deleteEtfTransaction: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        etfTransactions: state.etfTransactions.filter(t => t.id !== id),
        isSaving: false,
      }));

      const docRef = doc(db, 'users', userId);
      const sanitizedTxs = useInvestmentStore.getState().etfTransactions.map(sanitizeEtfTransaction);
      await updateDoc(docRef, { etfTransactions: sanitizedTxs });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ETF transaction';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteEtfTransaction error:', err);
    }
  },

  setBrokerConfig: async (config) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateBrokerConfig(config);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set({ brokerConfig: config, isSaving: false });
      const docRef = doc(db, 'users', userId);
      const sanitizedConfig = sanitizeBrokerConfig(config);
      await updateDoc(docRef, { brokerConfig: sanitizedConfig });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set broker config';
      set({ saveError: errorMessage, isSaving: false });
      console.error('setBrokerConfig error:', err);
    }
  },

  addPortfolioSnapshot: async (snapshot) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        portfolioSnapshots: [...state.portfolioSnapshots, snapshot],
        isSaving: false,
      }));

      const docRef = doc(db, 'users', userId);
      const sanitizedSnapshots = useInvestmentStore.getState().portfolioSnapshots.map(s => ({
        id: s.id,
        date: s.date,
        totalInvested: s.totalInvested,
        currentValue: s.currentValue,
        cashBalance: s.cashBalance,
        accruedInterest: s.accruedInterest,
        holdings: s.holdings,
      }));
      await updateDoc(docRef, { portfolioSnapshots: sanitizedSnapshots });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add portfolio snapshot';
      set({ saveError: errorMessage, isSaving: false });
      console.error('addPortfolioSnapshot error:', err);
    }
  },

  setCurrentPrice: (price) => {
    set({ currentPrice: price, lastPriceUpdate: new Date().toISOString() });
  },

  setAll: (data) => {
    const {
      etfTransactions,
      portfolioSnapshots,
      brokerConfig,
      currentPrice,
      lastPriceUpdate,
      isSaving,
      saveError,
    } = data;

    set({
      etfTransactions: etfTransactions ?? get().etfTransactions,
      portfolioSnapshots: portfolioSnapshots ?? get().portfolioSnapshots,
      brokerConfig: brokerConfig ?? get().brokerConfig,
      currentPrice: currentPrice !== undefined ? currentPrice : get().currentPrice,
      lastPriceUpdate: lastPriceUpdate !== undefined ? lastPriceUpdate : get().lastPriceUpdate,
      isSaving: isSaving ?? get().isSaving,
      saveError: saveError !== undefined ? saveError : get().saveError,
    });
  },

  clearSaveError: () => set({ saveError: null }),
}));
