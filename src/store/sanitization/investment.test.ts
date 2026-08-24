import {
  sanitizeEtfTransaction,
  sanitizeBrokerAccount,
  sanitizeCashAdjustment,
  sanitizeDividendEntry,
} from './investment'

describe('sanitizeEtfTransaction', () => {
  it('uppercases ticker and coerces numbers', () => {
    const out = sanitizeEtfTransaction({
      id: 'e1',
      date: '2026-08-01',
      ticker: 'vwce.de',
      description: '',
      type: 'buy',
      units: 10,
      price: 100,
      totalAmount: 1000,
      accountId: 'acc-1',
    })
    expect(out.ticker).toBe('VWCE.DE')
    expect(out.units).toBe(10)
    expect(out.price).toBe(100)
  })

  it('computes totalAmount when missing', () => {
    const out = sanitizeEtfTransaction({
      id: 'e1',
      date: '2026-08-01',
      ticker: 'VWCE.DE',
      description: '',
      type: 'buy',
      units: 10,
      price: 100,
      totalAmount: 0,
      accountId: 'acc-1',
    })
    expect(out.totalAmount).toBe(1000)
  })
})

describe('sanitizeBrokerAccount', () => {
  it('trims id/name and uppercases ticker', () => {
    const out = sanitizeBrokerAccount({
      id: ' b1 ',
      name: ' Trade Republic ',
      ticker: 'vwce.de',
      baseLumpSum: 1000,
      monthlyPacAmount: 200,
      interestRate: 2.5,
    })
    expect(out.id).toBe('b1')
    expect(out.name).toBe('Trade Republic')
    expect(out.ticker).toBe('VWCE.DE')
  })
})

describe('sanitizeCashAdjustment', () => {
  it('defaults notes to null', () => {
    const out = sanitizeCashAdjustment({
      id: 'c1',
      brokerId: 'b1',
      amount: 500,
      date: '2026-08-01',
    })
    expect(out.notes).toBeNull()
  })
  it('preserves notes when present', () => {
    const out = sanitizeCashAdjustment({
      id: 'c1',
      brokerId: 'b1',
      amount: 500,
      date: '2026-08-01',
      notes: 'refund',
    })
    expect(out.notes).toBe('refund')
  })
})

describe('sanitizeDividendEntry', () => {
  it('uppercases ticker', () => {
    const out = sanitizeDividendEntry({
      id: 'd1',
      brokerId: 'b1',
      ticker: 'vwce.de',
      amount: 10,
      date: '2026-08-01',
      type: 'dividend',
    })
    expect(out.ticker).toBe('VWCE.DE')
  })
})
