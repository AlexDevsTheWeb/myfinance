---
type: Plan
description: "Stamp duty (0.20%) and capital losses tracking — five-wave task breakdown."
title: "Italian Tax Enhancements — Stamp Duty & Capital Losses"
tags: [plan, investment, tax, italian]
created: 2026-07-06
updated: 2026-07-06
status: draft
sources: ["raw/110-italian-tax-enhancements/110-italian-tax-enhancements.md"]
related: ["features/investment-professional-enhancements", "features/investment-tracking-v3"]
---

# Plan: Italian Tax Enhancements

Status: **draft**
Priority: **medium**

## Goal

Implement Italian stamp duty (0.20% imposta di bollo) and capital losses tracking (zainetto fiscale) in the investment tax module.

---

## Steps

### Wave 1 — Types & Data Model

- [ ] **1.1** Add `LossCarryForward` interface to `investment.types.ts` — `{ year: number; amount: number }`
- [ ] **1.2** Extend `TaxYearSummary` with `realizedLosses` and `stampDuty` fields
- [ ] **1.3** Add `lossCarryForwards: LossCarryForward[]` field to `InvestmentState` in `useInvestmentStore.ts`
- [ ] **1.4** Add `setLossCarryForwards` action to `InvestmentState` (Firestore persist)
- [ ] **1.5** Add validation & sanitization for `LossCarryForward` in `validation.ts` / `sanitization/index.ts`

### Wave 2 — Loss Computation in useTaxTracking

- [ ] **2.1** Modify `computeRealizedGains()` in `useTaxTracking.ts` to also track losses (remove `realizedGain > 0` filter)
- [ ] **2.2** Add `computeNetGains()` — gains minus losses per year
- [ ] **2.3** Add `computeTaxDue()` — 26% on net gains only (skip if net ≤ 0)
- [ ] **2.4** Add carry-forward logic — apply prior-year losses to current-year net gains
- [ ] **2.5** Return new fields from `useTaxTracking`: `yearlyLedger`, `totalRealizedLosses`, `totalNetGains`, `carryForwardBalance`

### Wave 3 — Stamp Duty Computation

- [ ] **3.1** Create `computeStampDuty()` — 0.20% of total portfolio `currentValue` (pro-rata)
- [ ] **3.2** Wire stamp duty into `useTaxTracking` (accept `currentValue` from portfolio)
- [ ] **3.3** Return `annualStampDuty` from `useTaxTracking`

### Wave 4 — TaxPocketWidget UI

- [ ] **4.1** Add stamp duty display row in TaxPocketWidget (amount + label)
- [ ] **4.2** Add Tax Ledger table: Gains | Losses | Net Gains | Tax Due per year
- [ ] **4.3** Add carry-forward balance line below the ledger
- [ ] **4.4** Add i18n keys (EN/IT) for all new labels

### Wave 5 — Persistence & Integration

- [ ] **5.1** Add `lossCarryForwards` to Firestore save path in `useInvestmentStore`
- [ ] **5.2** Add `lossCarryForwards` to `backup/index.ts` (export + import)
- [ ] **5.3** Add `lossCarryForwards` to `setAll()` in the store
- [ ] **5.4** Verify `computeSnapshot` integration — stamp duty uses portfolio currentValue

---

## Dependencies

- [[wiki/features/investment-tracking-v3/investment-tracking-v3]] — TaxPocketWidget and useTaxTracking were created in V3
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]] — loss carry-forward is per-user, not per-broker
- Existing `usePortfolio().currentValue` — used for stamp duty calculation

## Verification

- `npm run build` passes (0 type errors, no unused imports)
- TaxPocketWidget shows stamp duty row below capital gains
- TaxPocketWidget shows Tax Ledger with per-year gains/losses/net
- Selling at a loss creates a negative entry in the ledger
- Carry-forward balance persists across page reload (Firestore read)
