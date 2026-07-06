# GitHub Issue #110 — Italian Tax Enhancements

**URL:** https://github.com/AlexDevsTheWeb/myfinance/issues/110
**Author:** @AlexDevsTheWeb
**Created:** 2026-07-03
**Status:** OPEN
**Labels:** feature

---

## Description

### 1. Stamp Duty (Imposta di Bollo — 0.20%)

The current TaxPocketWidget only tracks 26% capital gains tax. Italian law also imposes a 0.20% stamp duty on the total portfolio market value.

**Requirements:**
- Calculate 0.20% stamp duty on total portfolio value (pro-rata or year-end)
- Display annual stamp duty alongside capital gains tax in TaxPocketWidget
- Duty applies to total market value of financial assets held with an Italian intermediary

### 2. Capital Losses Tracking (Zainetto Fiscale)

The `useTaxTracking` hook only tracks positive realized gains. Losses are silently ignored.

**Requirements:**
- Track realized capital losses from sell transactions
- Italian rules: ETF capital losses can offset gains (same category) within the same tax year, or carry forward up to 4 years
- Add "Tax Ledger" section to TaxPocketWidget showing:
  - Current year realized gains / losses
  - Net gains (gains − losses)
  - Tax due on net gains
  - Loss carry-forward balance from previous years
- Loss carry-forward needs per-year persistence (new Firestore field)

---

## Files Affected

- `src/analytics/hooks/useTaxTracking.ts` — extend with loss computation
- `src/components/investment/TaxPocketWidget.tsx` — display stamp duty + loss ledger
- `src/store/useInvestmentStore.ts` — persist loss carry-forwards
- `src/store/types/investment.types.ts` — new types for stamp duty and loss tracking
