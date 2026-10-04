---
type: Plan
title: "Explicit `any` removal (Issue #126)"
description: "Removed all 64 explicit `any` usages and 18 no-explicit-any directives across 10 files, in 7 reviewable slices, with zero behaviour change and zero new lint problems."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/126"
tags: [plan, tech-debt, typescript, refactor]
created: 2026-10-04
updated: 2026-10-04
status: completed
sources: ["raw/fix-YATF-126/fix-YATF-126.md"]
related: ["wiki/architecture/concerns-and-tech-debt", "wiki/conventions/coding-conventions", "wiki/features/test-infrastructure/test-infrastructure"]
---

# Plan: Explicit `any` removal (Issue #126)

Status: completed
Priority: medium
PR: [#184](https://github.com/AlexDevsTheWeb/myfinance/pull/184) (draft, branch `fix/YATF-126`)

## Goal

Eliminate every explicit `any` and every `no-explicit-any` suppression in `src/`, replacing each with a type that reflects what the code actually handles — without changing runtime behaviour.

## Scope

The issue text estimated "62 occurrences across 19 files". The measured inventory was **64 across 10 files**, plus **18 directives**. The estimate was off, so the work was driven off the measurement rather than the issue.

## Steps

Seven commits, each independently reviewable and verified. Tests came before the riskiest change.

1. [x] Capture a machine-readable lint baseline (`--format json`) so regressions are provable, not asserted
2. [x] Write 36 characterization tests for `converters.ts` **against the untyped code**
3. [x] `converters.ts` — introduce `RawRecord` and narrow read helpers; drop 18 `any` + file disable
4. [x] `TransactionForm.tsx` + callers — export `TransactionFormData`, type 14 handlers and `renderOption`
5. [x] Investment components — type `EtfTransactionForm` (10) and `BrokerSettingsModal` (6); drop 2 dead directives
6. [x] `CarPage.tsx` + `ConfigPage.tsx` — type 7 handlers; replace the flat `any` dialog config with a discriminated union
7. [x] `store/sanitization/*` — return the canonical doc interfaces; drop 8 dead directives
8. [x] `AnalysisTables.tsx` — describe the two table row shapes; drop 2 `any`

## Implementation Notes

Three usage groups drove the approach:

- **Event handlers** (`e: any`) discarded the target element type and pushed casts to use sites. Fixed at the handler, using `React.ChangeEvent<HTMLInputElement>` — including MUI `TextField select`, which reports `ChangeEvent<HTMLInputElement>` rather than `SelectChangeEvent`.
- **Firestore deserialization** (`data: any`) was load-bearing: `data.field ?? fallback` only compiled because the shape was unknown. Replaced with small narrowing readers (`readString`, `readNumber`, `readStringArray`, `readBoolean`) that preserve the original coercion semantics, including `Boolean(value)` and null-aware fallbacks.
- **Loose arrays** (`cats: any[]`, `data: any[]`) hid the element shape, making indexed access unchecked.

### Type errors that `any` had been hiding

Four real defects only surfaced once the types were honest:

- `ConfigPage` opened recurring dialogs with `financeType: rec.type`, which can be `'transfer'` — outside the `income | expense` union the `any` signature silently accepted. The recurring variant now uses a wider `TransactionType`.
- `handleOpenDialog` read `config?.oldValue` unconditionally, though only rename carries one.
- `CarPage`'s tire-type select cast `e.target.value as any` into `'summer' | 'winter'`; it now narrows explicitly, so an unexpected value degrades to `'summer'` rather than reaching the store.
- `AnalysisTables` indexed a metrics object by a row key that included the sentinel `'separator'`. It only ever worked because that row short-circuits first; the union type now makes the invariant explicit.

## Behaviour deliberately preserved

- **Converter asymmetry.** `recurringTransactionConverter.fromFirestore` retains a non-null `monthOfYear` for *every* frequency, while `toFirestore` writes it only for `yearly`. Characterization tests pin this. It is inconsistent, but it is a data-compat decision, not a typing one — documented, not silently "fixed".
- **`null` vs `undefined` in sanitizers.** `sanitizeTransaction`/`sanitizeRecurring` emit `null` for absent optionals because Firestore treats the two differently. This is why they return `TransactionDoc`/`RecurringTransactionDoc` rather than `ITransaction`, whose optionals are typed `| undefined`.
- `DocumentData` was rejected as a return type: it is `Record<string, any>`, which merely relocated the unsafety into `useFinanceStore`.

## Dead directives

Suppressions that no longer suppressed anything were removed so lint output reflects real problems again:

- `sanitization/investment.ts` — 6 of its 8 directives were already dead.
- `EtfTransactionModal.tsx`, `InvestmentPage.tsx` — dead directives.

One unrelated dead `no-unused-vars` directive in `CarPage.tsx` was left alone as out of scope.

## Verification

| Check | Baseline | After |
|-------|----------|-------|
| `tsc -b` | clean | clean |
| `vitest run` | 11 files / 162 tests | 12 files / 198 tests, all passing |
| `npm run build` | ✅ | ✅ (14,724 modules) |
| `eslint .` | 9 errors / 11 warnings | **7 errors / 3 warnings** |
| Explicit `any` in `src/` | 64 | **0** |
| `no-explicit-any` directives | 18 | **0** |

A rule-level diff against the captured baseline reports **4 fixes and 0 new problems**, which is the claim that actually matters — an error/warning count alone would hide a fix-plus-regression.

The 10 remaining lint problems are pre-existing React-hook issues (`set-state-in-effect`, `set-state-in-render`, `exhaustive-deps`) plus `no-useless-assignment` and `prefer-const`. None are type-safety related.

## Dependencies

- [[wiki/features/test-infrastructure/test-infrastructure]] — the 36 converter tests extend this suite; `vi.mock('firebase/firestore')` was required because `converters.ts` creates converters at module scope.
- [[wiki/conventions/coding-conventions]] — typing conventions applied throughout.

## Related

- [[wiki/architecture/concerns-and-tech-debt]] — this plan closes the `any`-in-19-files entry
- [[wiki/queries/new-user-auth-flow]] — follow-on sweep candidate; same technique applies
- Source: [raw/fix-YATF-126](raw/fix-YATF-126/fix-YATF-126.md)
