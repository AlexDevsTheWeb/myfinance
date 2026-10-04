import {
  computeBudgetProgress,
  computeSavingsRate,
  computeBurnUpData,
  getPeriodDateRangeFromTarget,
} from './budgetEngine'

// Fixed August 2026 window
const RANGE = { start: '2026-08-01', end: '2026-08-31' }

const tx = (overrides: Partial<import('../store/types').ITransaction>) =>
  ({
    id: 'id',
    date: '2026-08-15',
    description: 'desc',
    category: 'Food',
    subcategory: 'Groceries',
    amount: 100,
    type: 'expense' as const,
    accountId: 'acc-1',
    ...overrides,
  })

describe('computeBudgetProgress', () => {
  it('returns no snapshots when there are no targets', () => {
    const { snapshots, summary } = computeBudgetProgress([], [], RANGE)
    expect(snapshots).toEqual([])
    expect(summary.totalIncome).toBe(0)
    expect(summary.totalExpenses).toBe(0)
  })

  it('flags target above 100% spent as breach', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 120 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].status).toBe('breach')
    expect(snapshots[0].percentage).toBe(120)
    expect(snapshots[0].actualSpent).toBe(120)
  })

  it('flags target at 70–99% as warning', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 80 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].status).toBe('warning')
  })

  it('marks target under 70% as safe', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 40 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].status).toBe('safe')
  })

  it('marks exactly 100% spent as breach (inclusive boundary)', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 100 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].percentage).toBe(100)
    expect(snapshots[0].status).toBe('breach')
  })

  it('keeps just-under-100% in the warning band', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 99 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].percentage).toBe(99)
    expect(snapshots[0].status).toBe('warning')
  })

  it('marks exactly 70% spent as warning (inclusive boundary)', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 70 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].percentage).toBe(70)
    expect(snapshots[0].status).toBe('warning')
  })

  it('marks just-under-70% as safe', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 69 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].percentage).toBe(69)
    expect(snapshots[0].status).toBe('safe')
  })

  it('computes savings rate from income and expenses', () => {
    const transactions = [
      tx({ type: 'income', category: 'Salary', amount: 2000, date: '2026-08-05' }),
      tx({ type: 'expense', category: 'Food', amount: 500 }),
    ]
    const { summary } = computeBudgetProgress(transactions, [], RANGE)
    expect(summary.totalIncome).toBe(2000)
    expect(summary.totalExpenses).toBe(500)
    expect(summary.savingsRate).toBeCloseTo(0.75)
  })

  it('ignores transactions outside the date range', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 30, date: '2026-07-01' })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(snapshots[0].actualSpent).toBe(0)
  })
})

describe('computeSavingsRate', () => {
  it('returns 0 when there is no income', () => {
    expect(computeSavingsRate([], RANGE)).toBe(0)
  })
  it('returns positive rate', () => {
    const rate = computeSavingsRate(
      [
        { ...tx({ category: 'Salary', amount: 1000 }), type: 'income' },
        tx({ category: 'Food', amount: 250 }),
      ],
      RANGE
    )
    expect(rate).toBeCloseTo(0.75)
  })
})

describe('computeBurnUpData', () => {
  it('returns empty when total budget is 0', () => {
    expect(computeBurnUpData([], [], RANGE)).toEqual([])
  })
  it('cumulates actual spend across expense days', () => {
    const points = computeBurnUpData(
      [
        tx({ category: 'Food', amount: 30, date: '2026-08-01' }),
        tx({ category: 'Food', amount: 20, date: '2026-08-03' }),
      ],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly', color: '#f00', createdAt: '2026-08-01', updatedAt: '2026-08-01' }],
      RANGE
    )
    expect(points).toHaveLength(2)
    expect(points[0].actual).toBe(30)
    expect(points[1].actual).toBe(50)
    expect(points[0].ideal).toBeGreaterThan(0)
  })
})

describe('getPeriodDateRangeFromTarget', () => {
  it('returns the full month for a monthly target', () => {
    const range = getPeriodDateRangeFromTarget({
      id: 't1',
      category: 'Food',
      targetAmount: 100,
      period: 'monthly',
      color: '#f00',
      createdAt: '2026-08-01',
      updatedAt: '2026-08-01',
    })
    expect(range.start).toMatch(/-\d{2}-01$/)
  })
})
