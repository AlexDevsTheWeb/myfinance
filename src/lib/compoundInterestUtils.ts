import type { IProjectionInput, IMonthlySnapshot } from '../store/types';

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

  return snapshots;
}
