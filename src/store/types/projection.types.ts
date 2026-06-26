export interface IProjectionInput {
  years: number;
  initialLumpSum: number;
  annualInflow: number;
  monthlyPac: number;
  etfAnnualReturn: number;
  cashAnnualRate: number;
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
