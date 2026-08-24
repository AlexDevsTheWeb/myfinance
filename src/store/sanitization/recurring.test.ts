import { sanitizeRecurring } from './recurring'

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

describe('sanitizeRecurring', () => {
  it('coerces numeric fields', () => {
    const out = sanitizeRecurring({
      ...baseRecurring,
      amount: '800' as unknown as number,
      dayOfMonth: '1' as unknown as number,
    })
    expect(out.amount).toBe(800)
    expect(out.dayOfMonth).toBe(1)
  })

  it('defaults frequency to monthly', () => {
    const out = sanitizeRecurring(baseRecurring)
    expect(out.frequency).toBe('monthly')
  })

  it('drops monthOfYear for non-yearly recurring', () => {
    const out = sanitizeRecurring({ ...baseRecurring, monthOfYear: 3 })
    expect(out).not.toHaveProperty('monthOfYear')
  })

  it('includes monthOfYear for yearly recurring', () => {
    const out = sanitizeRecurring({
      ...baseRecurring,
      frequency: 'yearly' as const,
      monthOfYear: 3,
    })
    expect(out.frequency).toBe('yearly')
    expect(out.monthOfYear).toBe(3)
  })

  it('includes cardId when present', () => {
    const out = sanitizeRecurring({ ...baseRecurring, cardId: 'card-1' })
    expect(out.cardId).toBe('card-1')
  })

  it('defaults endDate to null', () => {
    const out = sanitizeRecurring(baseRecurring)
    expect(out.endDate).toBeNull()
  })
})
