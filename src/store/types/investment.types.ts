export interface IETFTransaction {
  id: string;
  date: string;
  ticker: string;
  description: string;
  type: 'buy' | 'sell';
  units: number;
  price: number;
  totalAmount: number;
  accountId: string;
  brokerId?: string;
  notes?: string;
}

export interface IPortfolioSnapshot {
  id: string;
  date: string;
  totalInvested: number;
  currentValue: number;
  cashBalance: number;
  accruedInterest: number;
  holdings: IInvestmentHolding[];
}

export interface BrokerAccount {
  id: string;
  name: string;
  ticker: string;
  baseLumpSum: number;
  monthlyPacAmount: number;
  interestRate: number;
}

export interface AssetHolding {
  ticker: string;
  brokerId: string;
  units: number;
}

/** @deprecated Use BrokerAccount[] instead. Kept for backward-compatible migration. */
export interface IBrokerConfig {
  brokerName: string;
  lumpSumAmount: number;
  monthlyPacAmount: number;
  ticker: string;
  interestRate: number;
}

export interface IInvestmentHolding {
  ticker: string;
  units: number;
  avgCost: number;
  currentPrice: number;
  value: number;
  returnPercent: number;
}

export interface CashAdjustment {
  id: string;
  brokerId: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface DividendEntry {
  id: string;
  brokerId: string;
  ticker: string;
  amount: number;
  date: string;
  type: 'dividend' | 'interest';
  notes?: string;
}

export interface IPortfolioHoldingInfo {
  ticker: string;
  units: number;
  price: number;
  avgCost: number;
}

export interface IPortfolioPoint {
  date: string;
  value: number;
  invested: number;
  holdings: IPortfolioHoldingInfo[];
}
