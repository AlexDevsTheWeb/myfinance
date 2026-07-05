import type { IETFTransaction, IBrokerConfig, BrokerAccount, CashAdjustment, DividendEntry } from '../types/investment.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeEtfTransaction = (tx: IETFTransaction): any => {
  return {
    id: tx.id,
    date: tx.date,
    ticker: tx.ticker.toUpperCase(),
    description: tx.description ?? '',
    type: tx.type,
    units: Number(tx.units),
    price: Number(tx.price),
    totalAmount: Number(tx.totalAmount) || Number(tx.units) * Number(tx.price),
    accountId: tx.accountId,
    notes: tx.notes ?? null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeBrokerConfig = (config: IBrokerConfig): any => {
  return {
    brokerName: config.brokerName,
    lumpSumAmount: Number(config.lumpSumAmount) || 0,
    monthlyPacAmount: Number(config.monthlyPacAmount) || 0,
    ticker: config.ticker.toUpperCase(),
    interestRate: Number(config.interestRate) || 0,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeBrokerAccount = (account: BrokerAccount): Record<string, unknown> => {
  return {
    id: account.id.trim(),
    name: account.name.trim(),
    ticker: (account.ticker ?? '').toUpperCase(),
    baseLumpSum: Number(account.baseLumpSum) || 0,
    monthlyPacAmount: Number(account.monthlyPacAmount) || 0,
    interestRate: Number(account.interestRate) || 0,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeBrokerAccounts = (accounts: BrokerAccount[]): Record<string, unknown>[] => {
  return accounts.map(sanitizeBrokerAccount);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeCashAdjustment = (adj: CashAdjustment): Record<string, unknown> => {
  return {
    id: adj.id,
    brokerId: adj.brokerId,
    amount: Number(adj.amount),
    date: adj.date,
    notes: adj.notes ?? null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeCashAdjustments = (adjustments: CashAdjustment[]): Record<string, unknown>[] => {
  return adjustments.map(sanitizeCashAdjustment);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeDividendEntry = (entry: DividendEntry): Record<string, unknown> => {
  return {
    id: entry.id,
    brokerId: entry.brokerId,
    ticker: entry.ticker.toUpperCase(),
    amount: Number(entry.amount),
    date: entry.date,
    type: entry.type,
    notes: entry.notes ?? null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeDividendEntries = (entries: DividendEntry[]): Record<string, unknown>[] => {
  return entries.map(sanitizeDividendEntry);
};
