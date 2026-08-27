import { vi } from 'vitest'
vi.mock('../../hooks/useMarketData', () => ({
  fetchQuote: vi.fn(async () => null),
}))

import {
  validateEtfTransaction,
  validateBrokerAccount,
  validateBrokerConfig,
  validateTicker,
  validateCashAdjustment,
  validateDividendEntry,
} from './investment.validation'

const baseEtf = {
  id: 'e1',
  date: '2026-08-01',
  ticker: 'VWCE.DE',
  description: '',
  type: 'buy' as const,
  units: 10,
  price: 100,
  totalAmount: 1000,
  accountId: 'acc-1',
}

describe('validateEtfTransaction', () => {
  it('accepts a valid ETF transaction', () => {
    expect(validateEtfTransaction(baseEtf)).toEqual({ valid: true })
  })
  it('rejects missing ticker', () => {
    expect(validateEtfTransaction({ ...baseEtf, ticker: '' })).toEqual({
      valid: false,
      error: 'Ticker symbol is required',
    })
  })
  it('rejects zero units', () => {
    expect(validateEtfTransaction({ ...baseEtf, units: 0 })).toEqual({
      valid: false,
      error: 'Units must be greater than 0',
    })
  })
  it('rejects zero price', () => {
    expect(validateEtfTransaction({ ...baseEtf, price: 0 })).toEqual({
      valid: false,
      error: 'Price must be greater than 0',
    })
  })
  it('rejects NaN units', () => {
    expect(validateEtfTransaction({ ...baseEtf, units: NaN })).toEqual({
      valid: false,
      error: 'Units must be greater than 0',
    })
  })
  it('rejects NaN price', () => {
    expect(validateEtfTransaction({ ...baseEtf, price: NaN })).toEqual({
      valid: false,
      error: 'Price must be greater than 0',
    })
  })
})

describe('validateTicker', () => {
  it('accepts uppercase symbol', () => {
    expect(validateTicker('VWCE.DE')).toEqual({ valid: true })
  })
  it('rejects invalid format', () => {
    expect(validateTicker('to o long ticker!')).toEqual({
      valid: false,
      error: expect.stringContaining('Invalid ticker format'),
    })
  })
  it('rejects empty ticker', () => {
    expect(validateTicker('')).toEqual({ valid: false, error: 'Ticker is required' })
  })
})

describe('validateBrokerAccount', () => {
  it('accepts a valid broker account', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'Trade Republic',
        ticker: 'VWCE.DE',
        baseLumpSum: 1000,
        monthlyPacAmount: 200,
        interestRate: 2.5,
      })
    ).toEqual({ valid: true })
  })
  it('rejects missing name', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: '  ',
        ticker: 'VWCE.DE',
        baseLumpSum: 0,
        monthlyPacAmount: 0,
        interestRate: 0,
      })
    ).toEqual({ valid: false, error: 'Broker name is required' })
  })
  it('rejects interest rate above 100', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'TR',
        ticker: 'VWCE.DE',
        baseLumpSum: 0,
        monthlyPacAmount: 0,
        interestRate: 150,
      })
    ).toEqual({ valid: false, error: 'Interest rate must be between 0 and 100' })
  })
  it('rejects NaN base lump sum', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'TR',
        ticker: 'VWCE.DE',
        baseLumpSum: NaN,
        monthlyPacAmount: 0,
        interestRate: 0,
      })
    ).toEqual({ valid: false, error: 'Base lump sum must be 0 or greater' })
  })
  it('rejects NaN interest rate', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'TR',
        ticker: 'VWCE.DE',
        baseLumpSum: 0,
        monthlyPacAmount: 0,
        interestRate: NaN,
      })
    ).toEqual({ valid: false, error: 'Interest rate must be between 0 and 100' })
  })
})

describe('validateBrokerConfig', () => {
  it('accepts a valid broker config', () => {
    expect(
      validateBrokerConfig({
        brokerName: 'TR',
        lumpSumAmount: 1000,
        monthlyPacAmount: 200,
        ticker: 'VWCE.DE',
        interestRate: 3,
      })
    ).toEqual({ valid: true })
  })
  it('rejects missing ticker', () => {
    expect(
      validateBrokerConfig({
        brokerName: 'TR',
        lumpSumAmount: 0,
        monthlyPacAmount: 0,
        ticker: '',
        interestRate: 0,
      })
    ).toEqual({ valid: false, error: 'Ticker symbol is required' })
  })
})

describe('validateCashAdjustment', () => {
  it('accepts a valid adjustment', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: 'b1', amount: 500, date: '2026-08-01' })
    ).toEqual({ valid: true })
  })
  it('rejects zero amount', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: 'b1', amount: 0, date: '2026-08-01' })
    ).toEqual({ valid: false, error: 'Amount must be non-zero' })
  })
  it('rejects missing broker', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: '', amount: 500, date: '2026-08-01' })
    ).toEqual({ valid: false, error: 'Broker account is required' })
  })
  it('rejects NaN amount', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: 'b1', amount: NaN, date: '2026-08-01' })
    ).toEqual({ valid: false, error: 'Amount must be non-zero' })
  })
})

describe('validateDividendEntry', () => {
  it('accepts a valid dividend entry', () => {
    expect(
      validateDividendEntry({
        id: 'd1',
        brokerId: 'b1',
        ticker: 'VWCE.DE',
        amount: 10,
        date: '2026-08-01',
        type: 'dividend',
      })
    ).toEqual({ valid: true })
  })
  it('rejects non-positive amount', () => {
    expect(
      validateDividendEntry({
        id: 'd1',
        brokerId: 'b1',
        ticker: 'VWCE.DE',
        amount: 0,
        date: '2026-08-01',
        type: 'dividend',
      })
    ).toEqual({ valid: false, error: 'Amount must be greater than 0' })
  })
  it('rejects NaN amount', () => {
    expect(
      validateDividendEntry({
        id: 'd1',
        brokerId: 'b1',
        ticker: 'VWCE.DE',
        amount: NaN,
        date: '2026-08-01',
        type: 'dividend',
      })
    ).toEqual({ valid: false, error: 'Amount must be greater than 0' })
  })
})
