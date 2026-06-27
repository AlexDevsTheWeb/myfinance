import dayjs from 'dayjs';
import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useInvestmentStore } from '../store/useInvestmentStore';
import type { IETFTransaction } from '../store/types';

export interface HistorySnapshot {
  id?: string;
  date: string;
  totalInvested: number;
  currentValue: number;
  cashBalance: number;
  netWorth: number;
  holdings: {
    ticker: string;
    units: number;
    avgCost: number;
    price: number;
    value: number;
  }[];
  createdAt?: ReturnType<typeof serverTimestamp>;
}

function computeHistorySnapshot(
  etfTransactions: IETFTransaction[],
  currentPrice: number | null,
  cashBalance: number
): Omit<HistorySnapshot, 'date' | 'createdAt'> {
  let totalInvested = 0;
  const holdingsMap = new Map<string, { units: number; totalCost: number }>();

  for (const tx of etfTransactions) {
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
      const sellRatio = existing.units > 0 ? tx.units / existing.units : 0;
      holdingsMap.set(tx.ticker, {
        units: existing.units - tx.units,
        totalCost: existing.totalCost * (1 - sellRatio),
      });
    }
  }

  const holdings: {
    ticker: string;
    units: number;
    avgCost: number;
    price: number;
    value: number;
  }[] = [];
  let currentValue = 0;

  for (const [ticker, h] of holdingsMap.entries()) {
    if (h.units <= 0) continue;
    const avgCost = h.totalCost / h.units;
    const price = currentPrice ?? avgCost;
    const value = h.units * price;
    currentValue += value;
    holdings.push({ ticker, units: h.units, avgCost, price, value });
  }

  return {
    totalInvested: Math.round(totalInvested),
    currentValue: Math.round(currentValue),
    cashBalance: Math.round(cashBalance),
    netWorth: Math.round(currentValue + cashBalance),
    holdings,
  };
}

/**
 * Record a portfolio history snapshot to the subcollection.
 * Debounces to max 1 snapshot per day per user.
 * Returns true if written, false if skipped (already recorded today).
 */
export async function recordPortfolioSnapshot(userId: string): Promise<boolean> {
  const { currentPrice } = useInvestmentStore.getState();
  const today = dayjs().format('YYYY-MM-DD');

  const historyRef = collection(db, 'users', userId, 'portfolio_history');

  // Check if today already has a snapshot (daily debounce)
  const existingQuery = query(historyRef, where('date', '==', today), limit(1));
  const existing = await getDocs(existingQuery);
  if (!existing.empty) {
    return false; // Already recorded today
  }

  // Read cash balance from broker accounts
  const { brokerAccounts, etfTransactions: txs } = useInvestmentStore.getState();
  let totalLumpSum = 0;
  for (const broker of brokerAccounts) {
    totalLumpSum += broker.baseLumpSum;
  }
  let totalInvestedComputed = 0;
  for (const tx of txs) {
    if (tx.type === 'buy') totalInvestedComputed += tx.totalAmount;
    else totalInvestedComputed -= tx.totalAmount;
  }
  const cashBalance = Math.max(0, totalLumpSum - totalInvestedComputed);

  const snapshot = computeHistorySnapshot(txs, currentPrice, cashBalance);

  await addDoc(historyRef, {
    date: today,
    ...snapshot,
    createdAt: serverTimestamp(),
  });

  return true;
}

/**
 * React hook that automatically records a snapshot when called.
 * Intended to be triggered from store actions (not on every render).
 */
export function useHistoricalSnapshots() {
  return { recordPortfolioSnapshot };
}
