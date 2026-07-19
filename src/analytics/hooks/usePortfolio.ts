import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useInvestmentStore, calcAccruedInterest } from '../../store/useInvestmentStore';
import type { IPortfolioPoint, IInvestmentHolding, CashAdjustment, DividendEntry } from '../../store/types';

function sumAdjustments(adjustments: CashAdjustment[], brokerIds: string[]): number {
  return adjustments
    .filter(a => brokerIds.includes(a.brokerId))
    .reduce((sum, a) => sum + a.amount, 0);
}

function sumDividends(entries: DividendEntry[], brokerIds: string[]): number {
  return entries
    .filter(d => brokerIds.includes(d.brokerId))
    .reduce((sum, d) => sum + d.amount, 0);
}

export function usePortfolio() {
  const { etfTransactions, portfolioSnapshots, brokerAccounts, prices, selectedBrokerId, cashAdjustments, dividendEntries } = useInvestmentStore();

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

    const currentValue = (() => {
      let val = 0;
      let hasPrice = false;
      for (const [ticker, h] of holdingsMap.entries()) {
        if (h.units <= 0) continue;
        const price = prices[ticker];
        if (price != null) {
          val += h.units * price;
          hasPrice = true;
        }
      }
      if (hasPrice) return val;
      const latestSnapshot = portfolioSnapshots.length > 0
        ? portfolioSnapshots[portfolioSnapshots.length - 1]
        : null;
      return latestSnapshot?.currentValue ?? 0;
    })();

    const totalReturn = currentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const isPositive = currentValue >= totalInvested;

    const chartData: IPortfolioPoint[] = [...portfolioSnapshots]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(s => ({
        date: s.date,
        value: s.currentValue,
        invested: s.totalInvested,
        holdings: s.holdings.map(h => ({
          ticker: h.ticker,
          units: h.units,
          price: h.currentPrice,
          avgCost: h.avgCost,
        })),
      }));

    // Compute cash balance: aggregated or per-broker
    const activeBrokers = selectedBrokerId === 'all'
      ? brokerAccounts
      : brokerAccounts.filter(b => b.id === selectedBrokerId);

    const activeBrokerIds = activeBrokers.map(b => b.id);

    const totalBaseLumpSum = activeBrokers.reduce((sum, b) => sum + b.baseLumpSum, 0);
    const totalCashAdjustments = sumAdjustments(cashAdjustments, activeBrokerIds);
    const totalDividends = sumDividends(dividendEntries, activeBrokerIds);
    const cashBalance = Math.max(0, totalBaseLumpSum - totalInvested + totalCashAdjustments + totalDividends);
    const weightedRate = activeBrokers.length > 0
      ? activeBrokers.reduce((sum, b) => sum + b.interestRate, 0) / activeBrokers.length
      : 0;
    const accruedInterest = calcAccruedInterest(cashBalance, weightedRate);

    const holdings: IInvestmentHolding[] = [];
    for (const [ticker, h] of holdingsMap.entries()) {
      if (h.units <= 0) continue;
      const avgCost = h.totalCost / h.units;
      const unitPrice = prices[ticker] ?? avgCost;
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

    const monthlyDividends = dividendEntries
      .filter(d => activeBrokerIds.includes(d.brokerId) && dayjs(d.date).isSame(dayjs(), 'month'))
      .reduce((sum, d) => sum + d.amount, 0);

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
      monthlyDividends,
    };
  }, [etfTransactions, portfolioSnapshots, brokerAccounts, prices, selectedBrokerId, cashAdjustments, dividendEntries]);
}
