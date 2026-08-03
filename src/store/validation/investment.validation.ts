import type { IETFTransaction, IBrokerConfig, BrokerAccount, CashAdjustment, DividendEntry } from '../types/investment.types';
import { fetchQuote } from '../../hooks/useMarketData';

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

export function validateBrokerAccount(account: BrokerAccount): { valid: boolean; error?: string } {
  if (!account.name?.trim()) {
    return { valid: false, error: 'Broker name is required' };
  }
  if (typeof account.baseLumpSum !== 'number' || account.baseLumpSum < 0) {
    return { valid: false, error: 'Base lump sum must be 0 or greater' };
  }
  if (typeof account.monthlyPacAmount !== 'number' || account.monthlyPacAmount < 0) {
    return { valid: false, error: 'PAC amount must be 0 or greater' };
  }
  if (typeof account.interestRate !== 'number' || account.interestRate < 0 || account.interestRate > 100) {
    return { valid: false, error: 'Interest rate must be between 0 and 100' };
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

const TICKER_REGEX = /^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i;

export function validateTicker(ticker: string): { valid: boolean; error?: string } {
  if (!ticker?.trim()) {
    return { valid: false, error: 'Ticker is required' };
  }
  if (!TICKER_REGEX.test(ticker.trim())) {
    return {
      valid: false,
      error: 'Invalid ticker format. Expected format: SYMBOL or SYMBOL.EXCHANGE (e.g., EUNL.DE, VWCE.DE, AAPL)',
    };
  }
  return { valid: true };
}

export function validateCashAdjustment(adj: CashAdjustment): { valid: boolean; error?: string } {
  if (!adj.brokerId) {
    return { valid: false, error: 'Broker account is required' };
  }
  if (typeof adj.amount !== 'number' || adj.amount === 0) {
    return { valid: false, error: 'Amount must be non-zero' };
  }
  if (!adj.date) {
    return { valid: false, error: 'Date is required' };
  }
  return { valid: true };
}

export function validateDividendEntry(entry: DividendEntry): { valid: boolean; error?: string } {
  if (!entry.brokerId) {
    return { valid: false, error: 'Broker account is required' };
  }
  if (!entry.ticker?.trim()) {
    return { valid: false, error: 'Ticker symbol is required' };
  }
  if (typeof entry.amount !== 'number' || entry.amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  if (!entry.date) {
    return { valid: false, error: 'Date is required' };
  }
  return { valid: true };
}

export async function validateTickerWithApi(ticker: string): Promise<{ valid: boolean; warning?: string }> {
  const regexResult = validateTicker(ticker);
  if (!regexResult.valid) return regexResult;

  try {
    const quote = await fetchQuote(ticker);
    if (!quote?.regularMarketPrice) {
      return {
        valid: true,
        warning: `Ticker ${ticker} passes format check but could not be verified. Prices may not load.`,
      };
    }
    return { valid: true };
  } catch {
    return { valid: true, warning: 'Could not validate ticker. Check your connection.' };
  }
}
