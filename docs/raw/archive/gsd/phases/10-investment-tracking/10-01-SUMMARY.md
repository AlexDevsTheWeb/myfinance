# Summary: Plan 10-01 — Types, Schema, Converter

**Status:** Complete
**Date:** 2026-06-26

## What was built

### Files Created
- `src/store/types/investment.types.ts` — 5 interfaces: IETFTransaction, IPortfolioSnapshot, IBrokerConfig, IInvestmentHolding, IPortfolioPoint

### Files Modified
- `src/store/types/finance.types.ts` — ITransaction and IRecurringTransaction type unions widened to include `'transfer'`; IAppModules gained `investmentTracking: boolean`
- `src/store/types/index.ts` — Barrel re-exports all new investment types
- `src/store/defaults.ts` — Added Extraordinary Income category, investmentTracking module toggle, DEFAULT_BROKER_CONFIG
- `src/lib/converters.ts` — UserDoc extended with 3 fields; toFirestore/fromFirestore serialize/deserialize them; type guard accepts `'transfer'` in converters
- `src/store/backup/index.ts` — BackupPayload includes etfTransactions, portfolioSnapshots, brokerConfig; createBackup exports them
- `src/store/sync/index.ts` — getDefaultUserConfig returns default values for 3 new fields
- `src/components/forms/TransactionForm.tsx` — `type` prop widened
- `src/components/modals/TransactionModal.tsx` — `type` prop widened
- `src/pages/ConfigPage.tsx` — recurringForm `type` state widened
- `src/pages/DashboardPage.tsx` — `editType` state widened
- `src/pages/TransactionsPage.tsx` — `modalType` state widened

### Verification
- `npm run build` passes with zero type errors
