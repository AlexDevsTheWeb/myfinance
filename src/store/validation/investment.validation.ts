import type { IETFTransaction, IBrokerConfig } from '../types/investment.types';

export function validateEtfTransaction(tx: IETFTransaction): { valid: boolean; error?: string } {
  if (!tx.ticker?.trim()) {
    return { valid: false, error: 'Ticker symbol is required' };
  }
  if (typeof tx.units !== 'number' || tx.units <= 0) {
    return { valid: false, error: 'Units must be greater than 0' };
  }
  if (typeof tx.price !== 'number' || tx.price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  if (!tx.date) {
    return { valid: false, error: 'Date is required' };
  }
  if (!tx.accountId) {
    return { valid: false, error: 'Account is required' };
  }
  return { valid: true };
}

export function validateBrokerConfig(config: IBrokerConfig): { valid: boolean; error?: string } {
  if (!config.brokerName?.trim()) {
    return { valid: false, error: 'Broker name is required' };
  }
  if (!config.ticker?.trim()) {
    return { valid: false, error: 'Ticker symbol is required' };
  }
  if (typeof config.monthlyPacAmount !== 'number' || config.monthlyPacAmount < 0) {
    return { valid: false, error: 'PAC amount must be 0 or greater' };
  }
  if (typeof config.interestRate !== 'number' || config.interestRate < 0 || config.interestRate > 100) {
    return { valid: false, error: 'Interest rate must be between 0 and 100' };
  }
  return { valid: true };
}
