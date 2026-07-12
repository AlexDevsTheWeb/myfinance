# [FEATURE] Financial Projections & Compound Interest Simulator

> Source: GitHub Issue [#83](https://github.com/AlexDevsTheWeb/myfinance/issues/83)
> State: OPEN
> Labels: feature
> Created: 2026-06-08

## Objective

Create a predictive charting module that allows the user to simulate the long-term growth (e.g., 10 to 30 years) of their investment strategy based on compound interest and parametric market returns.

## Requirements

### 1. Simulation Engine (Deterministic Logic)

Implement a utility function that generates an array of historical-predictive data points.

**Inputs:**
- Investment Horizon (Years)
- Estimated Annual ETF Return (%)
- Broker Cash Interest Rate (%)
- Initial Lump-Sum (€)
- Monthly PAC Amount (€)

**Algorithm:**
Loop through each month, calculate the accrued interest on the uninvested broker cash, execute the monthly PAC transfer to the ETF component, and apply the compound market return to the total ETF asset value.

### 2. UI/UX Components

- Parametric Sliders: Material UI `<Slider />` components for changing the Horizon, ETF Return, and Cash Interest in real-time.
- Projection Chart: A smooth Area/Line Chart showing two lines: `Total Invested` (linear) vs `Projected Net Worth` (exponential curve).
- Summary Cards: Display final metrics at the end of the timeline: `Final Capital`, `Total Interests Earned`, and `Estimated Taxes`.

### Todo List

- [ ] Create the calculation engine (`compoundInterestUtils.ts`).
- [ ] Build the Simulation Workspace view with real-time slider controls.
- [ ] Bind the array output of the engine to a responsive Line/Area Chart.

## Code Reference

```typescript
interface ProjectionInput {
  years: number;
  initialLumpSum: number;
  annualInflow: number;
  monthlyPac: number;
  etfAnnualReturn: number;
  cashAnnualRate: number;
}

interface MonthlySnapshot {
  monthIndex: number;
  year: number;
  monthNum: number;
  totalInvested: number;
  brokerCash: number;
  etfValue: number;
  netWorth: number;
}

export const generateFinancialProjection = (input: ProjectionInput): MonthlySnapshot[] => {
  const { years, initialLumpSum, annualInflow, monthlyPac, etfAnnualReturn, cashAnnualRate } = input;
  const totalMonths = years * 12;
  const snapshots: MonthlySnapshot[] = [];
  const monthlyEtfRate = Math.pow(1 + etfAnnualReturn, 1 / 12) - 1;
  const monthlyCashRate = Math.pow(1 + cashAnnualRate, 1 / 12) - 1;
  let currentBrokerCash = initialLumpSum;
  let currentEtfValue = 0;
  let currentTotalInvested = initialLumpSum;

  for (let m = 1; m <= totalMonths; m++) {
    const currentYear = Math.ceil(m / 12);
    const monthOfCurrentYear = m % 12 === 0 ? 12 : m % 12;

    if (m > 1 && monthOfCurrentYear === 1) {
      currentBrokerCash += annualInflow;
      currentTotalInvested += annualInflow;
    }

    const accruedCashInterest = currentBrokerCash * monthlyCashRate;
    currentBrokerCash += accruedCashInterest;

    const actualPacAmount = currentBrokerCash >= monthlyPac ? monthlyPac : currentBrokerCash;
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
      netWorth: Math.round(currentEtfValue + currentBrokerCash)
    });
  }

  return snapshots;
};
```
