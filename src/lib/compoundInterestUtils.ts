import dayjs from 'dayjs';
import type { IProjectionInput, IMonthlySnapshot, IPortfolioSnapshot } from '../store/types';

export function computeCAGR(snapshots: IPortfolioSnapshot[]): number | null {
  const sorted = [...snapshots]
    .filter(s => s.totalInvested > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) return null;

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const years = dayjs(last.date).diff(dayjs(first.date), 'year', true);

  if (years < 1 / 12) return null;

  const startValue = first.totalInvested;
  const endValue = last.currentValue + last.cashBalance;

  if (startValue <= 0 || endValue <= 0) return null;

  const cagr = Math.pow(endValue / startValue, 1 / years) - 1;
  return Math.max(0, Math.min(0.20, cagr));
}

export function generateFinancialProjection(
  input: IProjectionInput
): IMonthlySnapshot[] {
  if (input.years <= 0) return [];

  const { years, initialLumpSum, annualInflow, monthlyPac, etfAnnualReturn, cashAnnualRate } = input;

  const totalMonths = years * 12;
  const monthlyEtfRate = Math.pow(1 + etfAnnualReturn, 1 / 12) - 1;
  const monthlyCashRate = Math.pow(1 + cashAnnualRate, 1 / 12) - 1;

  let currentBrokerCash = initialLumpSum;
  let currentEtfValue = 0;
  let currentTotalInvested = initialLumpSum;

  const snapshots: IMonthlySnapshot[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const currentYear = Math.ceil(m / 12);
    const monthOfCurrentYear = m % 12 === 0 ? 12 : m % 12;

    if (m > 1 && monthOfCurrentYear === 1) {
      currentBrokerCash += annualInflow;
      currentTotalInvested += annualInflow;
    }

    currentBrokerCash += currentBrokerCash * monthlyCashRate;

    const actualPacAmount = Math.min(monthlyPac, currentBrokerCash);
    currentBrokerCash -= actualPacAmount;
    currentEtfValue += actualPacAmount;

    currentEtfValue = currentEtfValue * (1 + monthlyEtfRate);

    snapshots.push({
      monthIndex: m,
      year: currentYear,
      monthNum: monthOfCurrentYear,
      totalInvested: Math.round(currentTotalInvested),
      brokerCash: Math.round(currentBrokerCash),
      etfValue: Math.round(currentEtfValue),
      netWorth: Math.round(currentEtfValue + currentBrokerCash),
    });
  }

  // Apply inflation adjustment if enabled (D-08)
  if (input.adjustForInflation) {
    const annualInflation = input.inflationRate ?? 0.02;
    // Per-month compounding for more accuracy (Pitfall 5 fix)
    const monthlyInflation = Math.pow(1 + annualInflation, 1 / 12) - 1;

    return snapshots.map(snapshot => {
      const inflationFactor = Math.pow(1 + monthlyInflation, snapshot.monthIndex);
      return {
        ...snapshot,
        netWorth: Math.round(snapshot.netWorth / inflationFactor),
        etfValue: Math.round(snapshot.etfValue / inflationFactor),
        brokerCash: Math.round(snapshot.brokerCash / inflationFactor),
      };
    });
  }

  return snapshots;
}
