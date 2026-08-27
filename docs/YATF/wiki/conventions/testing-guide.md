---
type: Convention
title: "Testing Guide — Using the Vitest Infrastructure"
description: "How to run, write, and mock tests effectively with the project's Vitest setup — conventions, gotchas, and coverage map."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/127"
tags: [convention, testing, quality]
created: 2026-08-24
updated: 2026-08-27
status: active
sources: ["raw/test-infrastructure/test-infrastructure.md"]
related: ["features/test-infrastructure/test-infrastructure", "architecture/testing-status", "decisions/typescript-7-upgrade"]
---

# Testing Guide — Using the Vitest Infrastructure

Practical guide for writing tests that fit this codebase. For status and roadmap see [[wiki/features/test-infrastructure/test-infrastructure]]; for the current coverage snapshot see [[wiki/architecture/testing-status]].

## Running Tests

```bash
npm test                                  # full suite, single run (CI-style)
npm run test:watch                        # watch mode for iteration
npm test src/store/sanitization           # filter by path
npm test -t "rejects zero units"          # filter by test name
npm run build                             # typechecks tests too (see Gotchas)
```

## Where Tests Live

- **Colocate** the test next to the module it covers: `src/lib/budgetEngine.ts` → `src/lib/budgetEngine.test.ts`. Same folder = same relative imports (`./budgetEngine`).
- **Shared helpers** (setup, future Firestore fakes) live in `src/test/` — already wired via `setupFiles` in `vitest.config.ts`.

## Writing Tests

- **No imports needed for the API**: `describe`, `it`, `expect`, `vi` are globals (`vitest/globals` in tsconfig).
- **Characterization-first for existing code**: write the test against current behavior; if an assertion fails, the test is wrong or you found a bug — investigate before changing either side. Never "fix" a test to pass without understanding why it failed.
- **Determinism**: anything date-relative must take an explicit range. Budget engine functions default to `dayjs()` — always pass an explicit `{ start, end }` like the existing tests do.
- **Assert exactly**: prefer `toEqual({ valid: false, error: 'Description is required' })` over checking `.valid` alone — exact-shape assertions catch branch-order regressions. Use `stringContaining` only when the message wording is genuinely volatile.
- **Name tests after behavior**, not mechanics ("applies inflation adjustment to netWorth", not "test 5").

## Mocking

Rule of thumb: mock **import-time side effects**, never the module under test.

```ts
// vi.mock calls are hoisted above imports — placement at top is convention
import { vi } from 'vitest'
vi.mock('../../hooks/useMarketData', () => ({
  fetchQuote: vi.fn(async () => null),
}))
import { validateEtfTransaction } from './investment.validation'  // safe: chain severed
```

- The mock specifier must match what the source file imports, resolved from the test's own directory.
- **Firebase is never loaded in unit tests** — if importing a module drags in `../lib/firebase`, mock the intermediate module (the hook/store) that pulls it in.
- Zustand stores can be tested directly via `useXStore.getState().action()` once Phase 2's Firestore fake lands — no store mocking needed.

## Gotchas (this repo specifically)

1. **`tsc -b` typechecks your tests.** Test files must be type-clean or `npm run build` breaks. Fixture objects may need required-but-unused fields (e.g. `BudgetTarget.color/createdAt/updatedAt`) to satisfy interfaces.
2. **Ambient types are app-wide.** `vitest/globals` + jest-dom matchers come from `tsconfig.app.json` `types` — don't add per-file references.
3. **Never run bare `npx eslint <file>`** — it crashes on TS files here (TS7/TS6 programmatic-API override). Use `npm run lint`; new files should add zero problems to the baseline.
4. **Commit convention**: `test: <what> (#<issue>)`, one logical suite per commit.

## Coverage Map & Extension Points

Current suites (Phase 1): finance validation, investment validation, sanitization ×3, budget engine, compound interest utils — 78 tests across 7 files.

### Phase 2 — Store Actions (next)

Infrastructure first: `src/test/firestore-fake.ts` (in-memory Map keyed by path strings, supports `.withConverter()`, `writeBatch` queue, `onSnapshot` callbacks) + `src/test/mock-auth.ts` (fixed `uid`).

Then `src/store/useFinanceStore.test.ts` — test directly via `useFinanceStore.getState().action()`:
- Transaction CRUD (`addTransaction`, `updateTransaction`, `deleteTransaction`)
- Recurring CRUD + `checkRecurring` generation engine
- Category/subcategory rename+remap cascade
- `_migrateToMultiAccount`, account/card CRUD, error rollback paths

Mock pattern for store tests:
```ts
vi.mock('../../lib/firebase', () => ({ db: fakeDb }))
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ user: { uid: 'test-user-123' } }) }
}))
```

### Phase 3 — Investment Logic

Pure calc tests first (`computeSnapshot`, `calcAccruedInterest`, migration functions), then `useInvestmentStore.test.ts` with the same Firestore fake:
- ETF transaction CRUD + snapshot recomputation
- Broker account CRUD, cash adjustments, dividends
- PAC confirm/dismiss, `takeSnapshot`, `loadHistoricalSnapshots`

### Phase 4 — Components & Sync Hooks

Add to `src/test/setup.ts`: i18n wrapper (`I18nextProvider`), MUI `ThemeProvider`.

Sync hook tests (`useSyncFinance.test.ts`, `useInvestmentSync.test.ts`, `useBudgetSync.test.ts`) — mock `onSnapshot` callback invocation from the Firestore fake.

Component tests (RTL): `TransactionForm`, `TransactionError`, `AccountCard`, `ProtectedRoute`.

Known suspected quirks — do not pin deeper without an issue: ~~`monthOfYear: 0` dropped for yearly recurring~~ (investigated 2026-08-24: intended — domain is 1–12, see [[wiki/features/test-infrastructure/test-infrastructure]]); NaN now rejected at validation via `Number.isFinite` guards — keep that pattern for new numeric checks (bare `x <= 0` never catches NaN).

## Related

- [[wiki/features/test-infrastructure/test-infrastructure]] — infrastructure feature & roadmap
- [[wiki/architecture/testing-status]] — live coverage snapshot
- [[wiki/conventions/coding-conventions]] — general code style
- [[wiki/decisions/typescript-7-upgrade]] — why the build behaves this way
- Source: [raw/test-infrastructure/test-infrastructure.md](raw/test-infrastructure/test-infrastructure.md)
