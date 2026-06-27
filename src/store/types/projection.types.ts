export interface IProjectionInput {
  years: number;
  initialLumpSum: number;
  annualInflow: number;
  monthlyPac: number;
  etfAnnualReturn: number;
  cashAnnualRate: number;
  adjustForInflation?: boolean;  // default false (D-08)
  inflationRate?: number;        // default 0.02 (2%)
}

export interface IMonthlySnapshot {
  monthIndex: number;
  year: number;
  monthNum: number;
  totalInvested: number;
  brokerCash: number;
  etfValue: number;
  netWorth: number;
}
