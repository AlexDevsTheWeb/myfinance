import dayjs from 'dayjs';
import { create } from 'zustand';
import { doc, updateDoc, collection, getDocs, query, orderBy, limit as fbLimit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import type { PacState } from '../lib/converters';
import type { IBrokerConfig, IETFTransaction, IPortfolioSnapshot, IInvestmentHolding, BrokerAccount, AssetHolding, CashAdjustment, DividendEntry } from './types';
import { validateEtfTransaction, validateBrokerConfig, validateBrokerAccount, validateCashAdjustment, validateDividendEntry } from './validation';
import { sanitizeEtfTransaction, sanitizeBrokerConfig, sanitizeBrokerAccounts, sanitizeCashAdjustments, sanitizeDividendEntries } from './sanitization';
import { recordPortfolioSnapshot } from '../hooks/useHistoricalSnapshots';
import * as Defaults from './defaults';

export interface InvestmentState {
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerConfig: IBrokerConfig;
  brokerAccounts: BrokerAccount[];
  assetHoldings: AssetHolding[];
  selectedBrokerId: string | 'all';
  brokerTransactions: Record<string, IETFTransaction[]>;
  pacState: PacState;
  currentPrice: number | null;
  prices: Record<string, number>;
  lastPriceUpdate: string | null;
  isSaving: boolean;
  isLoading: boolean;
  saveError: string | null;
  cashAdjustments: CashAdjustment[];
  dividendEntries: DividendEntry[];

  addEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  updateEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  deleteEtfTransaction: (id: string) => Promise<void>;
  setBrokerConfig: (config: IBrokerConfig) => Promise<void>;
  addPortfolioSnapshot: (snapshot: IPortfolioSnapshot) => Promise<void>;
  setCurrentPrice: (price: number) => void;
  setPrices: (prices: Record<string, number>) => void;
  recomputeSnapshots: () => void;
  takeSnapshot: () => Promise<void>;
  loadHistoricalSnapshots: () => Promise<void>;
  setAll: (data: Partial<InvestmentState>) => void;
  clearSaveError: () => void;

  setSelectedBroker: (id: string | 'all') => void;
  addBrokerAccount: (account: BrokerAccount) => Promise<void>;
  updateBrokerAccount: (account: BrokerAccount) => Promise<void>;
  deleteBrokerAccount: (id: string) => Promise<void>;
  addPendingPacTransaction: (pending: { brokerId: string; amount: number; date: string; status: 'pending' }) => void;
  confirmPacTransaction: (selectedAccountId: string) => Promise<void>;
  dismissPacTransaction: () => void;
  addCashAdjustment: (adj: CashAdjustment) => Promise<void>;
  deleteCashAdjustment: (id: string) => Promise<void>;
  addDividendEntry: (entry: DividendEntry) => Promise<void>;
  deleteDividendEntry: (id: string) => Promise<void>;
}

export function calcAccruedInterest(cashBalance: number, annualRate: number): number {
  return cashBalance * (annualRate / 100) / 12;
}

function computeSnapshot(etfTxs: IETFTransaction[], prices: Record<string, number>): Omit<IPortfolioSnapshot, 'id' | 'date'> {
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
    const price = prices[ticker] ?? avgCost;
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
  brokerAccounts: Defaults.DEFAULT_BROKER_ACCOUNTS,
  assetHoldings: [],
  selectedBrokerId: 'all',
  brokerTransactions: {},
  pacState: { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
  currentPrice: null,
  prices: {},
  lastPriceUpdate: null,
  isSaving: false,
  isLoading: true,
  saveError: null,
  cashAdjustments: [],
  dividendEntries: [],

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

      const computed = computeSnapshot(useInvestmentStore.getState().etfTransactions, get().prices);
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

      // Fire-and-forget subcollection snapshot write
      recordPortfolioSnapshot(userId).catch((err) => {
        console.error('Failed to record historical snapshot:', err);
      });
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
      // 1. Find the transaction being deleted (guard: T-12-06)
      const state = get();
      const txToDelete = state.etfTransactions.find(t => t.id === id);
      if (!txToDelete) {
        set({ saveError: 'Transaction not found', isSaving: false });
        return;
      }

      // 2. Optimistic: remove from state
      set((s) => ({
        etfTransactions: s.etfTransactions.filter(t => t.id !== id),
        isSaving: false,
      }));

      // 3. Persist
      const docRef = doc(db, 'users', userId);
      const sanitizedTxs = useInvestmentStore.getState().etfTransactions.map(sanitizeEtfTransaction);
      await updateDoc(docRef, { etfTransactions: sanitizedTxs });

      // 4. Compute new portfolio snapshot after deletion
      const freshState = useInvestmentStore.getState();
      const computed = computeSnapshot(freshState.etfTransactions, freshState.prices);
      const snapshot: IPortfolioSnapshot = {
        id: crypto.randomUUID(),
        date: dayjs().format('YYYY-MM-DD'),
        ...computed,
      };
      const prevSnapshots = get().portfolioSnapshots;
      set({ portfolioSnapshots: [...prevSnapshots, snapshot] });
      const sanitizedSnapshots = useInvestmentStore.getState().portfolioSnapshots.map(s => ({
        id: s.id, date: s.date, totalInvested: s.totalInvested,
        currentValue: s.currentValue, cashBalance: s.cashBalance,
        accruedInterest: s.accruedInterest, holdings: s.holdings,
      }));
      await updateDoc(docRef, { portfolioSnapshots: sanitizedSnapshots });

      // Fire-and-forget subcollection snapshot write
      recordPortfolioSnapshot(userId).catch((err) => {
        console.error('Failed to record historical snapshot:', err);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ETF transaction';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteEtfTransaction error:', err);
    }
  },

  /**
   * Legacy single-broker setter — maps to brokerAccounts[0] and is kept
   * for backward compat during migration (the existing BrokerSettingsModal
   * still calls this).
   */
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
      const migratedAccount: BrokerAccount = {
        id: 'broker-1',
        name: config.brokerName,
        ticker: config.ticker,
        baseLumpSum: config.lumpSumAmount,
        monthlyPacAmount: config.monthlyPacAmount,
        interestRate: config.interestRate,
      };
      set({ brokerConfig: config, brokerAccounts: [migratedAccount], isSaving: false });
      const docRef = doc(db, 'users', userId);
      const sanitizedConfig = sanitizeBrokerConfig(config);
      const sanitizedAccounts = sanitizeBrokerAccounts(get().brokerAccounts);
      await updateDoc(docRef, { brokerConfig: sanitizedConfig, brokerAccounts: sanitizedAccounts });
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

  setPrices: (prices) => {
    const current = get().prices;
    set({ prices: { ...current, ...prices }, lastPriceUpdate: new Date().toISOString() });
  },

  recomputeSnapshots: () => {
    const { portfolioSnapshots, prices } = get();
    const updated = portfolioSnapshots.map(snapshot => {
      const updatedHoldings = snapshot.holdings.map(h => {
        const marketPrice = prices[h.ticker] ?? h.avgCost;
        return {
          ...h,
          currentPrice: marketPrice,
          value: h.units * marketPrice,
          returnPercent: h.avgCost > 0 ? ((marketPrice - h.avgCost) / h.avgCost) * 100 : 0,
        };
      });
      const currentValue = updatedHoldings.reduce((sum, h) => sum + h.value, 0);
      return {
        ...snapshot,
        holdings: updatedHoldings,
        currentValue,
      };
    });
    set({ portfolioSnapshots: updated });
  },

  takeSnapshot: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const { etfTransactions: txs, prices: currentPrices } = get();
    if (txs.length === 0) return;

    const today = dayjs().format('YYYY-MM-DD');
    const computed = computeSnapshot(txs, currentPrices);
    const snapshot: IPortfolioSnapshot = {
      id: crypto.randomUUID(),
      date: today,
      ...computed,
    };

    const prevSnapshots = get().portfolioSnapshots;
    const existingToday = prevSnapshots.some(s => s.date === today);
    if (existingToday) {
      const recomputed = prevSnapshots.map(s => {
        if (s.date !== today) return s;
        const updatedHoldings = s.holdings.map(h => {
          const mp = currentPrices[h.ticker] ?? h.avgCost;
          return { ...h, currentPrice: mp, value: h.units * mp, returnPercent: h.avgCost > 0 ? ((mp - h.avgCost) / h.avgCost) * 100 : 0 };
        });
        return { ...s, holdings: updatedHoldings, currentValue: updatedHoldings.reduce((sum, h) => sum + h.value, 0) };
      });
      set({ portfolioSnapshots: recomputed });
    } else {
      set({ portfolioSnapshots: [...prevSnapshots, snapshot] });
    }

    try {
      const docRef = doc(db, 'users', userId);
      const sanitizedSnapshots = useInvestmentStore.getState().portfolioSnapshots.map(s => ({
        id: s.id, date: s.date, totalInvested: s.totalInvested,
        currentValue: s.currentValue, cashBalance: s.cashBalance,
        accruedInterest: s.accruedInterest, holdings: s.holdings,
      }));
      await updateDoc(docRef, { portfolioSnapshots: sanitizedSnapshots });
    } catch (err) {
      console.error('takeSnapshot persist error:', err);
    }

    recordPortfolioSnapshot(userId).catch(() => {});
  },

  loadHistoricalSnapshots: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    try {
      const historyRef = collection(db, 'users', userId, 'portfolio_history');
      const q = query(historyRef, orderBy('date', 'asc'), fbLimit(365));
      const snapshotDocs = await getDocs(q);

      const existingDates = new Set(get().portfolioSnapshots.map(s => s.date));
      const newSnapshots: IPortfolioSnapshot[] = [];

      snapshotDocs.forEach(doc => {
        const data = doc.data() as { date: string; totalInvested: number; currentValue: number; cashBalance: number; holdings: { ticker: string; units: number; avgCost: number; price: number; value: number }[] };
        if (!data.date || existingDates.has(data.date)) return;
        newSnapshots.push({
          id: doc.id,
          date: data.date,
          totalInvested: data.totalInvested ?? 0,
          currentValue: data.currentValue ?? 0,
          cashBalance: data.cashBalance ?? 0,
          accruedInterest: 0,
          holdings: (data.holdings ?? []).map(h => ({
            ticker: h.ticker,
            units: h.units,
            avgCost: h.avgCost,
            currentPrice: h.price,
            value: h.value,
            returnPercent: h.avgCost > 0 ? ((h.price - h.avgCost) / h.avgCost) * 100 : 0,
          })),
        });
        existingDates.add(data.date);
      });

      if (newSnapshots.length > 0) {
        const current = get().portfolioSnapshots;
        set({ portfolioSnapshots: [...current, ...newSnapshots].sort((a, b) => a.date.localeCompare(b.date)) });
      }
    } catch (err) {
      console.error('loadHistoricalSnapshots error:', err);
    }
  },

  setAll: (data) => {
    const {
      etfTransactions,
      portfolioSnapshots,
      brokerConfig,
      brokerAccounts,
      assetHoldings,
      selectedBrokerId,
      brokerTransactions,
      pacState,
      currentPrice,
      prices,
      lastPriceUpdate,
      isSaving,
      saveError,
      cashAdjustments,
      dividendEntries,
      isLoading,
    } = data;

    set({
      etfTransactions: etfTransactions ?? get().etfTransactions,
      portfolioSnapshots: portfolioSnapshots ?? get().portfolioSnapshots,
      brokerConfig: brokerConfig ?? get().brokerConfig,
      brokerAccounts: brokerAccounts ?? get().brokerAccounts,
      assetHoldings: assetHoldings ?? get().assetHoldings,
      selectedBrokerId: selectedBrokerId ?? get().selectedBrokerId,
      brokerTransactions: brokerTransactions ?? get().brokerTransactions,
      pacState: pacState ?? get().pacState,
      currentPrice: currentPrice !== undefined ? currentPrice : get().currentPrice,
      prices: prices !== undefined ? prices : get().prices,
      lastPriceUpdate: lastPriceUpdate !== undefined ? lastPriceUpdate : get().lastPriceUpdate,
      isSaving: isSaving ?? get().isSaving,
      saveError: saveError !== undefined ? saveError : get().saveError,
      cashAdjustments: cashAdjustments ?? get().cashAdjustments,
      dividendEntries: dividendEntries ?? get().dividendEntries,
      isLoading: isLoading ?? get().isLoading,
    });
  },

  clearSaveError: () => set({ saveError: null }),

  setSelectedBroker: (id) => {
    set({ selectedBrokerId: id });
  },

  addBrokerAccount: async (account) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateBrokerAccount(account);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({ brokerAccounts: [...state.brokerAccounts, account], isSaving: false }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeBrokerAccounts(get().brokerAccounts);
      await updateDoc(docRef, { brokerAccounts: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add broker account';
      set((state) => ({
        saveError: errorMessage,
        isSaving: false,
        brokerAccounts: state.brokerAccounts.filter(a => a.id !== account.id),
      }));
      console.error('addBrokerAccount error:', err);
    }
  },

  updateBrokerAccount: async (account) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateBrokerAccount(account);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        brokerAccounts: state.brokerAccounts.map(a => (a.id === account.id ? account : a)),
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeBrokerAccounts(get().brokerAccounts);
      await updateDoc(docRef, { brokerAccounts: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update broker account';
      set({ saveError: errorMessage, isSaving: false });
      console.error('updateBrokerAccount error:', err);
    }
  },

  deleteBrokerAccount: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        brokerAccounts: state.brokerAccounts.filter(a => a.id !== id),
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeBrokerAccounts(get().brokerAccounts);
      await updateDoc(docRef, { brokerAccounts: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete broker account';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteBrokerAccount error:', err);
    }
  },

  addPendingPacTransaction: (pending) => {
    const state = get();
    const perBrokerLastGeneration = {
      ...state.pacState.perBrokerLastGeneration,
      [pending.brokerId]: dayjs(pending.date).format('YYYY-MM'),
    };
    set({
      pacState: {
        ...state.pacState,
        pendingTransaction: { ...pending, status: 'pending' },
        perBrokerLastGeneration,
      },
    });
  },

  confirmPacTransaction: async (selectedAccountId) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const pending = get().pacState.pendingTransaction;
    if (!pending) return;

    set({ saveError: null, isSaving: true });
    try {
      // Resolve actual ticker from broker account
      const broker = get().brokerAccounts.find(b => b.id === selectedAccountId);
      const ticker = broker?.ticker ?? selectedAccountId;

      // Create IETFTransaction from pending PAC
      const tx: IETFTransaction = {
        id: crypto.randomUUID(),
        date: pending.date,
        ticker,
        description: 'System-Generated Buy',
        type: 'buy',
        units: 0,
        price: 0,
        totalAmount: pending.amount,
        accountId: selectedAccountId,
      };

      // Add the transaction to etfTransactions
      const prevTxs = get().etfTransactions;
      const sorted = [tx, ...prevTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const pacState = {
        lastGenerationDate: pending.date,
        pendingTransaction: null,
        perBrokerLastGeneration: {
          ...get().pacState.perBrokerLastGeneration,
          [pending.brokerId]: dayjs(pending.date).format('YYYY-MM'),
        },
      };
      set({ etfTransactions: sorted, pacState, isSaving: false });

      const docRef = doc(db, 'users', userId);
      const sanitizedTxs = get().etfTransactions.map(sanitizeEtfTransaction);
      await updateDoc(docRef, { etfTransactions: sanitizedTxs, pacState });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to confirm PAC transaction';
      set({ saveError: errorMessage, isSaving: false });
      console.error('confirmPacTransaction error:', err);
    }
  },

  dismissPacTransaction: () => {
    const state = get();
    set({ pacState: { ...state.pacState, pendingTransaction: null } });
  },

  addCashAdjustment: async (adj) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateCashAdjustment(adj);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        cashAdjustments: [...state.cashAdjustments, adj],
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeCashAdjustments(get().cashAdjustments);
      await updateDoc(docRef, { cashAdjustments: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add cash adjustment';
      set((state) => ({
        saveError: errorMessage,
        isSaving: false,
        cashAdjustments: state.cashAdjustments.filter(a => a.id !== adj.id),
      }));
      console.error('addCashAdjustment error:', err);
    }
  },

  deleteCashAdjustment: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        cashAdjustments: state.cashAdjustments.filter(a => a.id !== id),
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeCashAdjustments(get().cashAdjustments);
      await updateDoc(docRef, { cashAdjustments: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete cash adjustment';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteCashAdjustment error:', err);
    }
  },

  addDividendEntry: async (entry) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const validation = validateDividendEntry(entry);
    if (!validation.valid) {
      set({ saveError: validation.error, isSaving: false });
      return;
    }

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        dividendEntries: [...state.dividendEntries, entry],
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeDividendEntries(get().dividendEntries);
      await updateDoc(docRef, { dividendEntries: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add dividend entry';
      set((state) => ({
        saveError: errorMessage,
        isSaving: false,
        dividendEntries: state.dividendEntries.filter(e => e.id !== entry.id),
      }));
      console.error('addDividendEntry error:', err);
    }
  },

  deleteDividendEntry: async (id) => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    set({ saveError: null, isSaving: true });
    try {
      set((state) => ({
        dividendEntries: state.dividendEntries.filter(e => e.id !== id),
        isSaving: false,
      }));
      const docRef = doc(db, 'users', userId);
      const sanitized = sanitizeDividendEntries(get().dividendEntries);
      await updateDoc(docRef, { dividendEntries: sanitized });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dividend entry';
      set({ saveError: errorMessage, isSaving: false });
      console.error('deleteDividendEntry error:', err);
    }
  },
}));
