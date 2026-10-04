---
title: "Replace `any` types with proper typed interfaces"
issue: 126
status: complete
priority: medium
labels: tech-debt
pr: 184
---

## Summary

Issue 126: Replace `any` types with proper typed interfaces. Draft PR #184 on branch `fix/YATF-126`.

## Findings

The issue text said "62 occurrences across 19 files". Measured inventory before starting was **64 occurrences across 10 files**, plus **18 `no-explicit-any` directives**:

| File | Count | Notes |
|------|-------|-------|
| `src/lib/converters.ts` | 18 | Firestore converters; file-level disable |
| `src/components/forms/TransactionForm.tsx` | 14 | file-level disable |
| `src/components/investment/EtfTransactionForm.tsx` | 10 | file-level disable |
| `src/pages/CarPage.tsx` | 7 | file-level disable |
| `src/components/investment/BrokerSettingsModal.tsx` | 6 | file-level disable |
| `src/pages/ConfigPage.tsx` | 3 | file-level disable |
| `src/store/sanitization/investment.ts` | 2 | + 6 dead directives |
| `src/components/analysis/AnalysisTables.tsx` | 2 | no disable → 2 lint errors |
| `src/store/sanitization/transaction.ts` | 1 | |
| `src/store/sanitization/recurring.ts` | 1 | |

## Analysis

Most usages fell into three groups:

1. **React event handlers** — `e: any` in `onChange`, which discarded the target element type and forced casts at use sites.
2. **Firestore deserialization** — `data: any` in converters and sanitizers. Here `any` was load-bearing: it let `data.someField ?? fallback` compile against arbitrary shapes, so every read was unchecked.
3. **Loose collection/array params** — `cats: any[]`, `data: any[]`, where the element shape was never described, making indexed access (`m[row.key].toLocaleString()`) unchecked.

## Implementation

Six reviewable slices, each with its own commit. Tests were written **before** touching `converters.ts`.

| # | Commit | Scope | Change |
|---|--------|-------|--------|
| 1 | `a37d45f` | `converters.test.ts` | 36 characterization tests written first, against untyped code |
| 2 | `d9746f8` | `converters.ts` | `RawRecord` + `asRecord`/`asArray`/`asRecordArray`/`readString`/`readNumber`/`readStringArray`/`readBoolean`; removed 18 `any` + file disable |
| 3 | `513baf2` | `TransactionForm.tsx` + callers | Exported `TransactionFormData`; typed 14 handlers; typed `renderOption` |
| 4 | `0f47632` | investment components | Typed `EtfTransactionForm` (10) and `BrokerSettingsModal` (6); removed 2 dead directives |
| 5 | `f0289eb` | `CarPage.tsx`, `ConfigPage.tsx` | Typed 7 handlers; replaced flat `any` dialog config with a `DialogConfig` discriminated union |
| 6 | `1b24245` | `store/sanitization/*` | Sanitizers return `TransactionDoc`/`RecurringTransactionDoc`; removed 8 dead directives |
| 7 | `6a4119f` | `AnalysisTables.tsx` | Added `MonthlyMetrics`, `CategorySummary`, `SummaryRow`; removed 2 `any` |

### Behaviour preserved deliberately

The 36 characterization tests pin existing converter behaviour, including a pre-existing asymmetry that was **documented but not changed**: `recurringTransactionConverter.fromFirestore` keeps a non-null `monthOfYear` for every frequency, while `toFirestore` only writes it for `yearly`.

`sanitizeTransaction`/`sanitizeRecurring` also keep emitting `null` (not `undefined`) for absent optionals, because Firestore treats those differently. This is why they return `TransactionDoc`/`RecurringTransactionDoc` rather than `ITransaction` — the domain interface types those fields as `string | undefined`.

### Type corrections that were silently allowed by `any`

- `ConfigPage` opened recurring dialogs with `financeType: rec.type`, which can be `'transfer'` — outside the `income | expense` the `any`-typed signature had accepted without complaint. The recurring variant of the union now uses `TransactionType`.
- `handleOpenDialog` read `config?.oldValue` unconditionally even though only rename carries one.
- `CarPage`'s tire select cast `e.target.value as any` to reach `'summer' | 'winter'`; it now narrows explicitly, so an unexpected value degrades to `'summer'` instead of reaching the store unchecked.
- `AnalysisTables` indexed metrics by a row key that included the sentinel `'separator'`. It only worked because that row short-circuits; the union type makes the invariant explicit.

### Also removed

`no-explicit-any` disable directives that were already dead, so the lint signal reflects real problems:

- `investment.ts` — 6 of 8 directives were dead (those functions already returned `Record<string, unknown>`).
- `EtfTransactionModal.tsx`, `InvestmentPage.tsx` — dead directives.
- One unrelated dead `no-unused-vars` directive remains in `CarPage.tsx` (out of scope).

## Verification

| Check | Baseline | After |
|-------|----------|-------|
| `tsc -b` | clean | clean |
| `vitest run` | 11 files / 162 tests | 12 files / **198 tests** (36 added), all passing |
| `npm run build` | ✅ | ✅ (14,724 modules) |
| `eslint .` errors | 9 | **7** |
| `eslint .` warnings | 11 | **3** |
| Explicit `any` in `src/` | 64 | **0** |
| `no-explicit-any` directives | 18 | **0** |

Rule-level diff against the captured baseline: **4 fixes, 0 new problems**.

Cleared by this branch:
- `AnalysisTables.tsx` — 2 × `no-explicit-any`
- `investment.ts`, `EtfTransactionModal.tsx`, `InvestmentPage.tsx` — 8 unused-directive warnings

Remaining 7 errors / 3 warnings are pre-existing and unrelated (React hook correctness in `BudgetTargetDialog`, `TransactionForm`, `EtfTransactionModal`, `TransactionModal`, `useSyncFinance`; plus `no-useless-assignment` in `CarPage` and `prefer-const` in `store/sync`).

## Notes

- Lint must run with `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'` on the TS 7 setup; plain `npx eslint` fails with the known `Cjs` TypeError.
- Issues #137 and #127 were checked and are already resolved on `development` — no work needed.
