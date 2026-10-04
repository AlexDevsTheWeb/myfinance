# Design: Test Infrastructure (Vitest, Layered & Incremental)

- **Date:** 2026-08-06
- **Status:** Approved
- **Related issue:** [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127) — "Set up test infrastructure with Vitest"
- **Branch:** `feat/YATF-127-test-infra` → PR to `development`

## Goal

Establish a test infrastructure so the app can keep evolving without manually re-checking the same flows. Layered and incremental: each phase lands independently and adds value, matching the #127 roadmap.

**User priorities (most often re-checked by hand):**
1. Transaction/recurring CRUD + category renames/remaps + multi-account migration
2. Investment/PAC/tax logic
3. Validation & sanitization

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runner | Vitest ^4 | Supports Vite 8 (reuses installed `vite`); natural Vite ecosystem fit |
| DOM env | jsdom | Needed for store/component phases |
| Firebase in tests | Mock the SDK (`vi.mock`) | Fast, no emulator/Java dep, no real network |
| Where tests run | Local only for now | No CI workflow in this scope |
| Coverage target | Start with `validation`, `sanitization`, `budgetEngine`, `compoundInterestUtils` | Pure, fast, highest-value first |

## Architecture / Components

### Tooling & Configuration

**devDependencies to add:**
- `vitest@^4`
- `jsdom`
- `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` (component phase)
- `@vitest/coverage-v8` (optional, coverage reporting)

**`vitest.config.ts`** (separate from `vite.config.ts`, mirrors its `react()` plugin):

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    exclude: [...defaults, 'dist/**'],
  },
})
```

**Scripts:** `"test": "vitest run"`, `"test:watch": "vitest"`.

**TS 7 quirk:** `tsc -b` typechecks all of `src/` including test files. Add `"vitest/globals"` and `"@testing-library/jest-dom"` to `tsconfig.app.json` `types` so the production build's typecheck does not break once tests exist.

### Test Directory Convention

- Colocate `*.test.ts(x)` next to source files (e.g. `src/store/validation/finance.validation.test.ts`).
- Shared helpers under `src/test/`: `setup.ts`, Firestore SDK mock factory, auth store mock.

## Phasing

### Phase 1 — Pure logic (infra + first wave)

- `src/store/validation/*.test.ts` — validateTransaction, validateRecurringTransaction, investment validators (boundary cases: missing fields, negative/zero amounts, date ordering).
- `src/store/sanitization/*.test.ts` — shape/type coercion, optional-field dropping, yearly `monthOfYear`/`cardId` handling.
- `src/lib/budgetEngine.test.ts`, `src/lib/compoundInterestUtils.test.ts` — math correctness.
- All pure; no DOM/mocks needed (jsdom still on for consistency).

### Phase 2 — Store actions (mocked SDK)

- `vi.mock` of `firebase/firestore` + `../lib/firebase`.
- Small in-memory fake for `doc`/`collection`/`getDocs`/`writeBatch`/`setDoc`/`updateDoc`/`deleteDoc` so `useFinanceStore` actions run against predictable state.
- `useAuthStore` mocked to return a fixed `uid`.
- Cover: add/update/delete transaction & recurring, category/subcategory rename+remap, `_migrateToMultiAccount`, `checkRecurring` generation.

### Phase 3 — Investment logic

- Pure calc tests first (capital gains, dividends, cash adjustments), then `useInvestmentStore` actions with the same mock strategy.

### Phase 4 — Components & sync hooks (deferred past this week)

- React Testing Library for critical paths (forms, save-error display).
- `useSyncFinance`/sync hooks against mocked SDK with fake snapshot listeners.
- Needs i18n + MUI test wrappers in `src/test/setup.ts`.

## Error Handling / Testing

- Every phase: `npm test` green; `npm run build` (typecheck incl. test files) green; `npm run lint` no **new** issues; OKF wiki check passes.

## Documentation

Per-phase YATF wiki workflow:
- Raw notes → `docs/YATF/raw/test-infrastructure/`
- Wiki page → `wiki/features/test-infrastructure/` (status: in-progress, updated each phase)
- Update `docs/YATF/index.md` (page count), append `docs/YATF/log.md`
- Comment on issue #127 linking the branch/PR

## Deferred

- CI (GitHub Actions) test runner
- Firestore Emulator-based integration tests
- Component & sync-hook tests (Phase 4)
