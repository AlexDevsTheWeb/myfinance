import { useMemo } from 'react';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import type { IETFTransaction } from '../../store/types';

export interface TaxYearSummary {
  year: number;
  realizedGains: number;
  taxDue: number;
}

function computeRealizedGains(txs: IETFTransaction[], brokerIds: string[]): TaxYearSummary[] {
  const filtered = txs.filter(tx => brokerIds.length === 0 || brokerIds.includes(tx.accountId));
  const sellsByYear = new Map<number, number>();
  const tickerMap = new Map<string, { units: number; totalCost: number }>();

  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of sorted) {
    const h = tickerMap.get(tx.ticker) || { units: 0, totalCost: 0 };
    if (tx.type === 'buy') {
      tickerMap.set(tx.ticker, {
        units: h.units + tx.units,
        totalCost: h.totalCost + tx.totalAmount,
      });
    } else {
      const sellRatio = h.units > 0 ? tx.units / h.units : 0;
      const costBasisRemoved = h.totalCost * sellRatio;
      const realizedGain = tx.totalAmount - costBasisRemoved;
      tickerMap.set(tx.ticker, {
        units: h.units - tx.units,
        totalCost: h.totalCost - costBasisRemoved,
      });
      if (realizedGain > 0) {
        const year = new Date(tx.date).getFullYear();
        sellsByYear.set(year, (sellsByYear.get(year) || 0) + realizedGain);
      }
    }
  }

  return Array.from(sellsByYear.entries())
    .map(([year, gains]) => ({
      year,
      realizedGains: gains,
      taxDue: gains * 0.26,
    }))
    .sort((a, b) => b.year - a.year);
}

export function useTaxTracking() {
  const { etfTransactions, selectedBrokerId, brokerAccounts } = useInvestmentStore();

  return useMemo(() => {
    const activeBrokerIds = selectedBrokerId === 'all'
      ? brokerAccounts.map(b => b.id)
      : [selectedBrokerId];

    const yearly = computeRealizedGains(etfTransactions, activeBrokerIds);
    const totalRealizedGains = yearly.reduce((sum, y) => sum + y.realizedGains, 0);
    const totalTaxDue = yearly.reduce((sum, y) => sum + y.taxDue, 0);

    return { yearly, totalRealizedGains, totalTaxDue };
  }, [etfTransactions, selectedBrokerId, brokerAccounts]);
}
