import { validateTransaction, validateRecurringTransaction } from './finance.validation'

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

const baseRecurring = {
  id: 'r1',
  description: 'Rent',
  category: 'Housing',
  subcategory: 'Rent',
  amount: 800,
  type: 'expense' as const,
  dayOfMonth: 1,
  accountId: 'acc-1',
  startDate: '2026-01-01',
}

describe('validateTransaction', () => {
  it('accepts a valid transaction', () => {
    expect(validateTransaction(baseTxn)).toEqual({ valid: true })
  })

  it('rejects missing description', () => {
    expect(validateTransaction({ ...baseTxn, description: '' })).toEqual({
      valid: false,
      error: 'Description is required',
    })
  })

  it('rejects non-positive amount', () => {
    expect(validateTransaction({ ...baseTxn, amount: 0 })).toEqual({
      valid: false,
      error: 'Amount must be greater than 0',
    })
  })

  it('rejects missing required fields', () => {
    expect(validateTransaction({ ...baseTxn, accountId: '' })).toEqual({
      valid: false,
      error: 'Missing required fields',
    })
  })
})

describe('validateRecurringTransaction', () => {
  it('accepts a valid recurring transaction', () => {
    expect(validateRecurringTransaction(baseRecurring)).toEqual({ valid: true })
  })

  it('rejects blank description', () => {
    expect(validateRecurringTransaction({ ...baseRecurring, description: '   ' })).toEqual({
      valid: false,
      error: 'Description is required',
    })
  })

  it('rejects negative amount', () => {
    expect(validateRecurringTransaction({ ...baseRecurring, amount: -5 })).toEqual({
      valid: false,
      error: 'Amount must be greater than 0',
    })
  })

  it('rejects end date before start date', () => {
    expect(
      validateRecurringTransaction({ ...baseRecurring, endDate: '2020-01-01' })
    ).toEqual({ valid: false, error: 'End date cannot be before start date' })
  })

  it('accepts end date after start date', () => {
    expect(
      validateRecurringTransaction({ ...baseRecurring, endDate: '2027-01-01' })
    ).toEqual({ valid: true })
  })
})
