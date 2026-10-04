import { computeCAGR, generateFinancialProjection } from './compoundInterestUtils'

const snapshot = (overrides: Partial<import('../store/types').IPortfolioSnapshot>) => ({
  id: 's',
  date: '2026-01-01',
  totalInvested: 1000,
  currentValue: 1000,
  cashBalance: 0,
  accruedInterest: 0,
  holdings: [],
  ...overrides,
})

describe('computeCAGR', () => {
  it('returns null with fewer than two snapshots', () => {
    expect(computeCAGR([])).toBeNull()
    expect(computeCAGR([snapshot({})])).toBeNull()
  })

  it('returns null when years is under a month', () => {
    expect(
      computeCAGR([
        snapshot({ date: '2026-01-01', totalInvested: 1000, currentValue: 1000 }),
        snapshot({ date: '2026-01-15', totalInvested: 1000, currentValue: 1010 }),
      ])
    ).toBeNull()
  })

  it('returns null when a snapshot has zero totalInvested', () => {
    expect(
      computeCAGR([
        snapshot({ date: '2025-01-01', totalInvested: 0 }),
        snapshot({ date: '2026-01-01', totalInvested: 1000, currentValue: 1200 }),
      ])
    ).toBeNull()
  })

  it('clamps CAGR to max 20%', () => {
    const cagr = computeCAGR([
      snapshot({ date: '2024-01-01', totalInvested: 1000, currentValue: 1000 }),
      snapshot({ date: '2026-01-01', totalInvested: 1000, currentValue: 50000 }),
    ])
    expect(cagr).toBe(0.2)
  })

  it('clamps a >20% annual return to the 20% cap', () => {
    const cagr = computeCAGR([
      snapshot({ date: '2025-01-01', totalInvested: 1000, currentValue: 1000 }),
      snapshot({ date: '2026-01-01', totalInvested: 1000, currentValue: 2000 }),
    ])
    // raw CAGR is 1.0 (2x over 1 year); computeCAGR clamps to max 0.20
    expect(cagr).toBe(0.2)
  })
})

describe('generateFinancialProjection', () => {
  it('returns empty for non-positive years', () => {
    expect(
      generateFinancialProjection({
        years: 0,
        initialLumpSum: 0,
        annualInflow: 0,
        monthlyPac: 0,
        etfAnnualReturn: 0.05,
        cashAnnualRate: 0.02,
        adjustForInflation: false,
      })
    ).toEqual([])
  })

  it('produces 12 snapshots for 1 year', () => {
    const snapshots = generateFinancialProjection({
      years: 1,
      // PAC is capped at available broker cash (min(monthlyPac, brokerCash)),
      // so the lump sum must fund 12 x 100 PAC for etfValue to reach 100
      initialLumpSum: 1200,
      annualInflow: 0,
      monthlyPac: 100,
      etfAnnualReturn: 0,
      cashAnnualRate: 0,
      adjustForInflation: false,
    })
    expect(snapshots).toHaveLength(12)
    expect(snapshots[11].monthIndex).toBe(12)
    expect(snapshots[0].etfValue).toBe(100) // 100 monthly PAC, 0 return
  })

  it('applies inflation adjustment to netWorth', () => {
    const withoutInflation = generateFinancialProjection({
      years: 1,
      initialLumpSum: 1200,
      annualInflow: 0,
      monthlyPac: 0,
      etfAnnualReturn: 0,
      cashAnnualRate: 0,
      adjustForInflation: false,
    })
    const withInflation = generateFinancialProjection({
      years: 1,
      initialLumpSum: 1200,
      annualInflow: 0,
      monthlyPac: 0,
      etfAnnualReturn: 0,
      cashAnnualRate: 0,
      adjustForInflation: true,
      inflationRate: 0.02,
    })
    expect(withoutInflation[11].netWorth).toBe(1200)
    // 1200 deflated by (1 + 2%)^1 over 12 months: round(1200 / 1.02) = 1176
    expect(withInflation[11].netWorth).toBe(1176)
    expect(withInflation[11].netWorth).toBeLessThan(withoutInflation[11].netWorth)
  })
})
