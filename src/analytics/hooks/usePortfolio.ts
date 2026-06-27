import { useMemo } from 'react';
import { useInvestmentStore, calcAccruedInterest } from '../../store/useInvestmentStore';
import type { IPortfolioPoint, IInvestmentHolding } from '../../store/types';

export function usePortfolio() {
  const { etfTransactions, portfolioSnapshots, brokerAccounts, currentPrice, selectedBrokerId } = useInvestmentStore();

  return useMemo(() => {
    // Filter by selected broker
    const filteredTxs = selectedBrokerId === 'all'
      ? etfTransactions
      : etfTransactions.filter(tx => tx.accountId === selectedBrokerId || (tx as any).brokerId === selectedBrokerId);

    // If no broker selected or filtered, show aggregated from all
    let totalInvested = 0;
    let totalUnits = 0;
    const holdingsMap = new Map<string, { units: number; totalCost: number }>();

    for (const tx of filteredTxs) {
      if (tx.type === 'buy') {
        totalInvested += tx.totalAmount;
        totalUnits += tx.units;
        const h = holdingsMap.get(tx.ticker) || { units: 0, totalCost: 0 };
        holdingsMap.set(tx.ticker, {
          units: h.units + tx.units,
          totalCost: h.totalCost + tx.totalAmount,
        });
      } else {
        totalInvested -= tx.totalAmount;
        totalUnits -= tx.units;
        const h = holdingsMap.get(tx.ticker) || { units: 0, totalCost: 0 };
        const sellRatio = h.units > 0 ? tx.units / h.units : 0;
        holdingsMap.set(tx.ticker, {
          units: h.units - tx.units,
          totalCost: h.totalCost * (1 - sellRatio),
        });
      }
    }

    const latestSnapshot = portfolioSnapshots.length > 0
      ? portfolioSnapshots[portfolioSnapshots.length - 1]
      : null;

    const price = currentPrice ?? (latestSnapshot && totalUnits > 0
      ? latestSnapshot.currentValue / totalUnits
      : null);

    const currentValue = price != null && totalUnits > 0
      ? totalUnits * price
      : (latestSnapshot?.currentValue ?? 0);

    const totalReturn = currentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const isPositive = currentValue >= totalInvested;

    const chartData: IPortfolioPoint[] = [...portfolioSnapshots]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => ({
        date: s.date,
        value: s.currentValue,
        invested: s.totalInvested,
      }));

    // Compute cash balance: aggregated or per-broker
    const activeBrokers = selectedBrokerId === 'all'
      ? brokerAccounts
      : brokerAccounts.filter(b => b.id === selectedBrokerId);

    // For aggregated: sum of all broker baseLumpSum - totalInvested
    // For per-broker: use the broker's own baseLumpSum
    const totalBaseLumpSum = activeBrokers.reduce((sum, b) => sum + b.baseLumpSum, 0);
    const cashBalance = Math.max(0, totalBaseLumpSum - totalInvested);
    const weightedRate = activeBrokers.length > 0
      ? activeBrokers.reduce((sum, b) => sum + b.interestRate, 0) / activeBrokers.length
      : 0;
    const accruedInterest = calcAccruedInterest(cashBalance, weightedRate);

    const holdings: IInvestmentHolding[] = [];
    for (const [ticker, h] of holdingsMap.entries()) {
      if (h.units <= 0) continue;
      const avgCost = h.totalCost / h.units;
      const unitPrice = price ?? avgCost;
      const value = h.units * unitPrice;
      holdings.push({
        ticker,
        units: h.units,
        avgCost,
        currentPrice: unitPrice,
        value,
        returnPercent: avgCost > 0 ? ((unitPrice - avgCost) / avgCost) * 100 : 0,
      });
    }

    const brokerName = selectedBrokerId === 'all'
      ? 'All Accounts'
      : activeBrokers[0]?.name ?? 'Broker';

    return {
      totalInvested,
      totalUnits,
      currentValue,
      totalReturn,
      totalReturnPercent,
      cashBalance,
      interestRate: weightedRate,
      accruedInterest,
      chartData,
      holdings,
      isPositive,
      brokerName,
    };
  }, [etfTransactions, portfolioSnapshots, brokerAccounts, currentPrice, selectedBrokerId]);
}
