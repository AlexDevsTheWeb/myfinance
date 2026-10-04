import { sanitizeTransaction } from './transaction'

const baseTxn = {
  id: '1',
  date: '2026-08-01',
  description: 'Groceries',
  category: 'Food',
  subcategory: 'Groceries',
  amount: 50,
  type: 'expense' as const,
  accountId: 'acc-1',
}

describe('sanitizeTransaction', () => {
  it('coerces amount to number', () => {
    const out = sanitizeTransaction({ ...baseTxn, amount: '50' as unknown as number })
    expect(out.amount).toBe(50)
    expect(typeof out.amount).toBe('number')
  })

  it('defaults optional fields to null', () => {
    const out = sanitizeTransaction(baseTxn)
    expect(out.recurringLinkId).toBeNull()
    expect(out.consumption).toBeNull()
    expect(out.readingDateStart).toBeNull()
    expect(out.readingDateEnd).toBeNull()
    expect(out.cardId).toBeNull()
  })

  it('passes through provided optional fields', () => {
    const out = sanitizeTransaction({
      ...baseTxn,
      recurringLinkId: 'r1',
      consumption: 12.5,
      cardId: 'card-1',
    })
    expect(out.recurringLinkId).toBe('r1')
    expect(out.consumption).toBe(12.5)
    expect(out.cardId).toBe('card-1')
  })

  it('treats empty consumption string as null', () => {
    const out = sanitizeTransaction({
      ...baseTxn,
      consumption: '' as unknown as number,
    })
    expect(out.consumption).toBeNull()
  })
})
