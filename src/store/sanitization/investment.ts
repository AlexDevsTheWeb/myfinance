import type { IETFTransaction, IBrokerConfig, BrokerAccount } from '../types/investment.types';

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
    baseLumpSum: Number(account.baseLumpSum) || 0,
    monthlyPacAmount: Number(account.monthlyPacAmount) || 0,
    interestRate: Number(account.interestRate) || 0,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeBrokerAccounts = (accounts: BrokerAccount[]): Record<string, unknown>[] => {
  return accounts.map(sanitizeBrokerAccount);
};
