---
type: Architecture
description: "Current testing infrastructure status — Vitest operational across two workspaces: 198 tests / 12 files in apps/web and 59 tests / 6 files in apps/website."
title: "Testing Status"
tags: [architecture, testing, quality, website]
created: 2026-06-22
updated: 2026-10-05
status: active
sources: ["raw/codebase/TESTING.md", "raw/website/website.md"]
related: ["architecture/concerns-and-tech-debt", "architecture/project-state", "features/test-infrastructure/test-infrastructure", "features/marketing-website/marketing-website", "architecture/monorepo-layout"]
---

# Testing Status

*Analysis: 2026-07-11 — **updated 2026-08-27**: All 4 phases of test infrastructure complete. See [[wiki/features/test-infrastructure/test-infrastructure]].*

## Current State (2026-10-05)

Two independent Vitest projects. The headline figure on this page had drifted
(153/11, from 2026-08-27); the app is actually at **198 tests / 12 files** after
the Phase 1 monorepo move added a file, and the website adds **59 tests / 6
files**. Both were re-verified by running them.

| Workspace | Command | Result |
|---|---|---|
| `apps/web` (the app) | `npm test` (root, delegates) | 198 passed / 12 files |
| `apps/website` (marketing site) | `npm run test --workspace apps/website` | 59 passed / 6 files |

`apps/web` Vitest ^4 + jsdom (`npm test` / `npm run test:watch`):
- **12 test files / 198 tests, all green** — finance validation, investment validation, sanitization ×3, budget engine, compound interest utils, store actions, sync hooks, components
- Firebase SDK mocked via `vi.mock`; tests colocated beside source; characterization-first approach
- `npm run build` typechecks test files too — ambient `vitest/globals` types configured in tsconfig

### `apps/website` tests

Separate `vitest.config.ts` (jsdom + `@testing-library/jest-dom` setup), run
explicitly because root `test` delegates to `apps/web` only — see
[[wiki/decisions/website-as-separate-hosting-target]].

| File | Guards |
|---|---|
| `content/site.test.ts` | Pricing model consistency (`79 / 12 ≈ 6.58`, annual total × 12), required content keys, and **every icon name in `site.ts` resolves** in `iconMap` |
| `theme/ColorModeProvider.test.tsx` | Toggle switches mode and persists to `localStorage`; stored preference is restored; system preference respected when nothing stored |
| `components/PricingTable.test.tsx` | Cycle toggle re-renders price, period and note together from one lookup |
| `components/BetaWaitlistDialog.test.tsx` | Rejects malformed addresses, and asserts the **absence** of "check your inbox" / "reserved your spot" copy |
| `components/FaqAccordion.test.tsx` | Expand/collapse and `aria-expanded` state |
| `App.test.tsx` | Section order, single `h1`, dialog opens from the hero CTA |

The two tests that matter most are the two negative ones. The pricing test
fails if a price is edited without its note — the failure mode the source export
actually had. The dialog test fails if the copy ever implies an address was
stored — the failure mode the source export actually had. Both are regression
tests for real bugs in the design source, not for hypotheticals.

## Priority Test Areas

### Unit Tests — Pure Functions (Highest Priority)

These have deterministic inputs/outputs and no external dependencies:

| Area | Files | What to Test | Priority |
|------|-------|--------------|----------|
| Validation | `src/store/validation/finance.validation.ts` | `validateTransaction`, `validateRecurringTransaction` | High |
| Investment validation | `src/store/validation/investment.validation.ts` | `validateEtfTransaction`, `validateBrokerConfig`, `validateBrokerAccount`, `validateTicker`, `validateCashAdjustment`, `validateDividendEntry` | High |
| Sanitization | `src/store/sanitization/` | `sanitizeTransaction`, `sanitizeRecurring`, `sanitizeInvestment` | High |
| Firestore converters | `src/lib/converters.ts` | `toFirestore` / `fromFirestore` — data ↔ type mapping (278 lines) | High |
| Budget engine | `src/lib/budgetEngine.ts` | `computeBudgetProgress` | High |
| Store defaults | `src/store/defaults.ts` | Constants correctness | Medium |
| Backup validation | `src/store/backup/index.ts` | `validateBackupData` | Medium |
| Env utilities | `src/utils/variables.utils.tsx` | `getEnvVar` | Medium |
| Analytics hooks | `src/analytics/hooks/` | All `useMemo`-based computations (useNetWorth, usePortfolio, etc.) | Medium |

### Integration Tests

| Area | What to Test | Phase | Priority |
|------|-------------|-------|----------|
| `useFinanceStore` actions | Transaction/recurring CRUD, category rename+remap, multi-account migration, `checkRecurring` generation, account/card CRUD, error rollback | 2 | High |
| `useInvestmentStore` actions | ETF CRUD, broker CRUD, cash adjustments, dividends, PAC, snapshot lifecycle | 3 | High |
| `useBudgetStore` actions | Budget target CRUD | 3 | Medium |
| Firebase sync hooks | `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` — snapshot → store, migration, orphan cleanup | 4 | Medium |

**Firestore fake design (Phase 2):** In-memory Map-based storage keyed by path strings. Supports `.withConverter()` pattern, `writeBatch` queuing with `.commit()` flush, `onSnapshot` callback invocation. Lives at `src/test/firestore-fake.ts`.

**Store testing approach:** Zustand stores tested directly via `useXStore.getState().action()` — no store mocking needed. Each test mocks `../lib/firebase` to re-export the fake `db`.

### Component Tests

| Component | What to Test | Phase | Priority |
|-----------|-------------|-------|----------|
| `TransactionForm.tsx` | Validation, field interactions, edit vs create | 4 | High |
| `TransactionError.tsx` | Renders on `saveError`, dismisses | 4 | High |
| `AccountCard.component.tsx` | Positive/negative balance | 4 | Medium |
| `ProtectedRoute` | Redirect on unauthenticated | 4 | Medium |

**Component test requirements (Phase 4):** i18n wrapper (`I18nextProvider`), MUI `ThemeProvider` wrapper, added to `src/test/setup.ts`.

### E2E Flows

Login → Dashboard → Full transaction CRUD → Multi-account → Car management → Language switch → Backup/import

## Recommended Test Setup

✅ **Done 2026-08-24** — vitest, jsdom, @testing-library/* and coverage-v8 are installed; `test`/`test:watch` scripts exist; mock strategy below adopted (Firebase mocked at module level).

### Mock Strategy
- **Firebase:** Mock `firebase/firestore` at module level with `vi.mock()`
- **Zustand stores:** Test directly via `useXStore.getState().action()` — no mocking needed
- **Components:** Wrap in `ThemeProvider` for MUI compatibility

## TypeScript vs Testing

TypeScript strict mode provides compile-time safety but cannot catch:
- Logical errors in validation/sanitization
- Incorrect Firestore data mapping
- UI rendering bugs
- State management edge cases
- User interaction flows

## Related

- [[wiki/features/test-infrastructure/test-infrastructure]]
- [[wiki/features/marketing-website/marketing-website]]
- [[wiki/decisions/website-as-separate-hosting-target]]
- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/architecture/project-state]]
