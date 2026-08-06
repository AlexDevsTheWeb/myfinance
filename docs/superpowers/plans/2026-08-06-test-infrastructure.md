# Test Infrastructure (Vitest) — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Vitest test runner and cover the pure logic layer (validation, sanitization, budget engine, compound interest) so the app can evolve without manual re-checking of those flows.

**Architecture:** Add Vitest (standalone `vitest.config.ts`), a jsdom DOM environment, globals, and a shared test setup. Colocate `*.test.ts(x)` beside source. Phase 1 restricts itself to pure, dependency-free modules (validation + sanitization + two lib files) — no Firebase, no store mocks, no components yet. Those are Phases 2–4 (documented, not in this plan's scope).

**Tech Stack:** Vitest 4, jsdom, Vite 8 (reused), TypeScript 7, already-installed `@vitejs/plugin-react`.

## Global Constraints

From `docs/superpowers/specs/2026-08-06-test-infrastructure-design.md` (approved):
- Vitest `^4` (reuses installed `vite`; supports Vite 8).
- Test environment: `jsdom`; `globals: true`; setup file `./src/test/setup.ts`.
- Scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.
- **TS 7 quirk:** add `"vitest/globals"` and `"@testing-library/jest-dom"` to `tsconfig.app.json` `types` so `tsc -b` (production build typecheck, which includes all of `src/`) does not break once test files exist.
- Test files colocated: `<file>.test.ts` next to the module under test.
- Shared helpers live in `src/test/`.
- Verification per task: `npm test` targeted run green; final `npm run build` and `npm run lint` no new issues; `python3 docs/YATF/scripts/okf_migrate.py --check` passes.
- Branch: `feat/YATF-127-test-infra`; PR to `development`.
- `investment.validation.ts` imports `fetchQuote` from `../../hooks/useMarketData` (which pulls in `useInvestmentStore` → Firebase). Tests must `vi.mock('../../hooks/useMarketData')` so the real store never loads.
- Do NOT modify `raw/` files. Wiki pages are compiled artifacts.
- 2026-08-06 build baseline lint = 19 problems (9 errors, 10 warnings) — do not add new ones.

---

### Task 1: Tooling — Vitest config, setup, scripts, tsconfig types

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json` (scripts + devDependencies)
- Modify: `tsconfig.app.json` (`types` array)

**Interfaces:**
- Consumes: existing `vite.config.ts` (mirror `react()` plugin config), `tsconfig.app.json`.
- Produces: runnable `npm test` / `npm run test:watch` commands; `src/test/setup.ts` (imported by Vitest's `setupFiles`), available to all later tasks.

- [ ] **Step 1: Install dev dependencies**

```bash
npm i -D vitest@^4 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

Expected: packages installed; `package.json` devDependencies updated.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

Create the directory and file:

```bash
mkdir -p src/test
```

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Add `type-checking` types to `tsconfig.app.json`**

In `tsconfig.app.json`, change the `"types"` line to:

```ts
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"],
```

- [ ] **Step 5: Add test scripts to `package.json` scripts**

Add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify the runner works**

Create a temporary smoke test to confirm globals + env work, then delete it:

```bash
cat > src/test/__smoke.test.ts << 'EOF'
it('runs in jsdom with globals', () => {
  expect(typeof window).toBe('object')
  expect(document).toBeDefined()
})
EOF
```

Run: `npm test`
Expected: 1 passing test.

Then delete it:

```bash
rm src/test/__smoke.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json tsconfig.app.json
git commit -m "test: add Vitest config, jsdom environment, and test scripts (#127)"
```

---

## Task 2: Finance validation unit tests

**Files:**
- Test: `src/store/validation/finance.validation.test.ts`

**Interfaces:**
- Consumes: `validateTransaction`, `validateRecurringTransaction` from `./finance.validation` (signatures: `(t: ITransaction) => { valid: boolean; error?: string }`, `(r: IRecurringTransaction) => { valid: boolean; error?: string }`).
- Produces: a passing test file covering all boundary cases in these two functions.

- [ ] **Step 1: Write the failing test**

```ts
import { validateTransaction, validateRecurringTransaction } from './finance.validation'

const baseTxn = {
  id: '1',
  date: '2026-08-01',
  description: 'Groceries',
  category: 'Food',
  subcategory: 'Groceries',
  amount: 50,
  type: 'expense' as const,
  accountId: 'acc-1',
}

const baseRecurring = {
  id: 'r1',
  description: 'Rent',
  category: 'Housing',
  subcategory: 'Rent',
  amount: 800,
  type: 'expense' as const,
  dayOfMonth: 1,
  accountId: 'acc-1',
  startDate: '2026-01-01',
}

describe('validateTransaction', () => {
  it('accepts a valid transaction', () => {
    expect(validateTransaction(baseTxn)).toEqual({ valid: true })
  })

  it('rejects missing description', () => {
    expect(validateTransaction({ ...baseTxn, description: '' })).toEqual({
      valid: false,
      error: 'Description is required',
    })
  })

  it('rejects non-positive amount', () => {
    expect(validateTransaction({ ...baseTxn, amount: 0 })).toEqual({
      valid: false,
      error: 'Amount must be greater than 0',
    })
  })

  it('rejects missing required fields', () => {
    expect(validateTransaction({ ...baseTxn, accountId: '' })).toEqual({
      valid: false,
      error: 'Missing required fields',
    })
  })
})

describe('validateRecurringTransaction', () => {
  it('accepts a valid recurring transaction', () => {
    expect(validateRecurringTransaction(baseRecurring)).toEqual({ valid: true })
  })

  it('rejects blank description', () => {
    expect(validateRecurringTransaction({ ...baseRecurring, description: '   ' })).toEqual({
      valid: false,
      error: 'Description is required',
    })
  })

  it('rejects negative amount', () => {
    expect(validateRecurringTransaction({ ...baseRecurring, amount: -5 })).toEqual({
      valid: false,
      error: 'Amount must be greater than 0',
    })
  })

  it('rejects end date before start date', () => {
    expect(
      validateRecurringTransaction({ ...baseRecurring, endDate: '2020-01-01' })
    ).toEqual({ valid: false, error: 'End date cannot be before start date' })
  })

  it('accepts end date after start date', () => {
    expect(
      validateRecurringTransaction({ ...baseRecurring, endDate: '2027-01-01' })
    ).toEqual({ valid: true })
  })
})
```

- [ ] **Step 2: Run to verify it fails (no test runner yet or no tests)**

Run: `npm test src/store/validation/finance.validation.test.ts`
Expected: file runs; tests pass against current implementation. (If Vitest reports 0 tests collected, re-run `npm test` from root.) Because the implementation already exists, this is a characterization test — it should pass immediately, confirming existing behavior.

- [ ] **Step 3: Commit**

```bash
git add src/store/validation/finance.validation.test.ts
git commit -m "test: finance validation unit tests (#127)"
```

---

## Task 3: Investment validation unit tests

**Files:**
- Test: `src/store/validation/investment.validation.test.ts`

**Interfaces:**
- Consumes: `validateEtfTransaction`, `validateBrokerAccount`, `validateBrokerConfig`, `validateTicker`, `validateCashAdjustment`, `validateDividendEntry` from `./investment.validation`.
- Produces: passing tests; a pattern for mocking `../../hooks/useMarketData`.

- [ ] **Step 1: Write the failing test**

```ts
import { vi } from 'vitest'
vi.mock('../../hooks/useMarketData', () => ({
  fetchQuote: vi.fn(async () => null),
}))

import {
  validateEtfTransaction,
  validateBrokerAccount,
  validateBrokerConfig,
  validateTicker,
  validateCashAdjustment,
  validateDividendEntry,
} from './investment.validation'

const baseEtf = {
  id: 'e1',
  date: '2026-08-01',
  ticker: 'VWCE.DE',
  description: '',
  type: 'buy' as const,
  units: 10,
  price: 100,
  totalAmount: 1000,
  accountId: 'acc-1',
}

describe('validateEtfTransaction', () => {
  it('accepts a valid ETF transaction', () => {
    expect(validateEtfTransaction(baseEtf)).toEqual({ valid: true })
  })
  it('rejects missing ticker', () => {
    expect(validateEtfTransaction({ ...baseEtf, ticker: '' })).toEqual({
      valid: false,
      error: 'Ticker symbol is required',
    })
  })
  it('rejects zero units', () => {
    expect(validateEtfTransaction({ ...baseEtf, units: 0 })).toEqual({
      valid: false,
      error: 'Units must be greater than 0',
    })
  })
  it('rejects zero price', () => {
    expect(validateEtfTransaction({ ...baseEtf, price: 0 })).toEqual({
      valid: false,
      error: 'Price must be greater than 0',
    })
  })
})

describe('validateTicker', () => {
  it('accepts uppercase symbol', () => {
    expect(validateTicker('VWCE.DE')).toEqual({ valid: true })
  })
  it('rejects invalid format', () => {
    expect(validateTicker('to o long ticker!')).toEqual({
      valid: false,
      error: expect.stringContaining('Invalid ticker format'),
    })
  })
  it('rejects empty ticker', () => {
    expect(validateTicker('')).toEqual({ valid: false, error: 'Ticker is required' })
  })
})

describe('validateBrokerAccount', () => {
  it('accepts a valid broker account', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'Trade Republic',
        ticker: 'VWCE.DE',
        baseLumpSum: 1000,
        monthlyPacAmount: 200,
        interestRate: 2.5,
      })
    ).toEqual({ valid: true })
  })
  it('rejects missing name', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: '  ',
        ticker: 'VWCE.DE',
        baseLumpSum: 0,
        monthlyPacAmount: 0,
        interestRate: 0,
      })
    ).toEqual({ valid: false, error: 'Broker name is required' })
  })
  it('rejects interest rate above 100', () => {
    expect(
      validateBrokerAccount({
        id: 'b1',
        name: 'TR',
        ticker: 'VWCE.DE',
        baseLumpSum: 0,
        monthlyPacAmount: 0,
        interestRate: 150,
      })
    ).toEqual({ valid: false, error: 'Interest rate must be between 0 and 100' })
  })
})

describe('validateBrokerConfig', () => {
  it('accepts a valid broker config', () => {
    expect(
      validateBrokerConfig({
        brokerName: 'TR',
        lumpSumAmount: 1000,
        monthlyPacAmount: 200,
        ticker: 'VWCE.DE',
        interestRate: 3,
      })
    ).toEqual({ valid: true })
  })
  it('rejects missing ticker', () => {
    expect(
      validateBrokerConfig({
        brokerName: 'TR',
        lumpSumAmount: 0,
        monthlyPacAmount: 0,
        ticker: '',
        interestRate: 0,
      })
    ).toEqual({ valid: false, error: 'Ticker symbol is required' })
  })
})

describe('validateCashAdjustment', () => {
  it('accepts a valid adjustment', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: 'b1', amount: 500, date: '2026-08-01' })
    ).toEqual({ valid: true })
  })
  it('rejects zero amount', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: 'b1', amount: 0, date: '2026-08-01' })
    ).toEqual({ valid: false, error: 'Amount must be non-zero' })
  })
  it('rejects missing broker', () => {
    expect(
      validateCashAdjustment({ id: 'c1', brokerId: '', amount: 500, date: '2026-08-01' })
    ).toEqual({ valid: false, error: 'Broker account is required' })
  })
})

describe('validateDividendEntry', () => {
  it('accepts a valid dividend entry', () => {
    expect(
      validateDividendEntry({
        id: 'd1',
        brokerId: 'b1',
        ticker: 'VWCE.DE',
        amount: 10,
        date: '2026-08-01',
        type: 'dividend',
      })
    ).toEqual({ valid: true })
  })
  it('rejects non-positive amount', () => {
    expect(
      validateDividendEntry({
        id: 'd1',
        brokerId: 'b1',
        ticker: 'VWCE.DE',
        amount: 0,
        date: '2026-08-01',
        type: 'dividend',
      })
    ).toEqual({ valid: false, error: 'Amount must be greater than 0' })
  })
})
```

- [ ] **Step 2: Run tests and verify they pass**

Run: `npm test src/store/validation/investment.validation.test.ts`
Expected: PASS (characterization tests against existing implementation).

- [ ] **Step 3: Commit**

```bash
git add src/store/validation/investment.validation.test.ts
git commit -m "test: investment validation unit tests (#127)"
```

---

## Task 4: Sanitization unit tests

**Files:**
- Test: `src/store/sanitization/transaction.test.ts`
- Test: `src/store/sanitization/recurring.test.ts`
- Test: `src/store/sanitization/investment.test.ts`

**Interfaces:**
- Consumes: `sanitizeTransaction` from `./transaction`, `sanitizeRecurring` from `./recurring`, and `sanitizeEtfTransaction`, `sanitizeBrokerAccount`, `sanitizeBrokerAccounts`, `sanitizeCashAdjustment`, `sanitizeCashAdjustments`, `sanitizeDividendEntry`, `sanitizeDividendEntries`, `sanitizeBrokerConfig` from `./investment`.
- Produces: passing tests confirming shape coercion, number coercion, and optional-field dropping.

- [ ] **Step 1: Write the transaction sanitizer test**

`src/store/sanitization/transaction.test.ts`:

```ts
import { sanitizeTransaction } from './transaction'

const baseTxn = {
  id: '1',
  date: '2026-08-01',
  description: 'Groceries',
  category: 'Food',
  subcategory: 'Groceries',
  amount: 50,
  type: 'expense' as const,
  accountId: 'acc-1',
}

describe('sanitizeTransaction', () => {
  it('coerces amount to number', () => {
    const out = sanitizeTransaction({ ...baseTxn, amount: '50' as unknown as number })
    expect(out.amount).toBe(50)
    expect(typeof out.amount).toBe('number')
  })

  it('defaults optional fields to null', () => {
    const out = sanitizeTransaction(baseTxn)
    expect(out.recurringLinkId).toBeNull()
    expect(out.consumption).toBeNull()
    expect(out.readingDateStart).toBeNull()
    expect(out.readingDateEnd).toBeNull()
    expect(out.cardId).toBeNull()
  })

  it('passes through provided optional fields', () => {
    const out = sanitizeTransaction({
      ...baseTxn,
      recurringLinkId: 'r1',
      consumption: 12.5,
      cardId: 'card-1',
    })
    expect(out.recurringLinkId).toBe('r1')
    expect(out.consumption).toBe(12.5)
    expect(out.cardId).toBe('card-1')
  })

  it('treats empty consumption string as null', () => {
    const out = sanitizeTransaction({
      ...baseTxn,
      consumption: '' as unknown as number,
    })
    expect(out.consumption).toBeNull()
  })
})
```

- [ ] **Step 2: Write the recurring sanitizer test**

`src/store/sanitization/recurring.test.ts`:

```ts
import { sanitizeRecurring } from './recurring'

const baseRecurring = {
  id: 'r1',
  description: 'Rent',
  category: 'Housing',
  subcategory: 'Rent',
  amount: 800,
  type: 'expense' as const,
  dayOfMonth: 1,
  accountId: 'acc-1',
  startDate: '2026-01-01',
}

describe('sanitizeRecurring', () => {
  it('coerces numeric fields', () => {
    const out = sanitizeRecurring({
      ...baseRecurring,
      amount: '800' as unknown as number,
      dayOfMonth: '1' as unknown as number,
    })
    expect(out.amount).toBe(800)
    expect(out.dayOfMonth).toBe(1)
  })

  it('defaults frequency to monthly', () => {
    const out = sanitizeRecurring(baseRecurring)
    expect(out.frequency).toBe('monthly')
  })

  it('drops monthOfYear for non-yearly recurring', () => {
    const out = sanitizeRecurring({ ...baseRecurring, monthOfYear: 3 })
    expect(out).not.toHaveProperty('monthOfYear')
  })

  it('includes monthOfYear for yearly recurring', () => {
    const out = sanitizeRecurring({
      ...baseRecurring,
      frequency: 'yearly' as const,
      monthOfYear: 3,
    })
    expect(out.frequency).toBe('yearly')
    expect(out.monthOfYear).toBe(3)
  })

  it('includes cardId when present', () => {
    const out = sanitizeRecurring({ ...baseRecurring, cardId: 'card-1' })
    expect(out.cardId).toBe('card-1')
  })

  it('defaults endDate to null', () => {
    const out = sanitizeRecurring(baseRecurring)
    expect(out.endDate).toBeNull()
  })
})
```

- [ ] **Step 3: Write the investment sanitizer test**

`src/store/sanitization/investment.test.ts`:

```ts
import {
  sanitizeEtfTransaction,
  sanitizeBrokerAccount,
  sanitizeCashAdjustment,
  sanitizeDividendEntry,
} from './investment'

describe('sanitizeEtfTransaction', () => {
  it('uppercases ticker and coerces numbers', () => {
    const out = sanitizeEtfTransaction({
      id: 'e1',
      date: '2026-08-01',
      ticker: 'vwce.de',
      description: '',
      type: 'buy',
      units: 10,
      price: 100,
      totalAmount: 1000,
      accountId: 'acc-1',
    })
    expect(out.ticker).toBe('VWCE.DE')
    expect(out.units).toBe(10)
    expect(out.price).toBe(100)
  })

  it('computes totalAmount when missing', () => {
    const out = sanitizeEtfTransaction({
      id: 'e1',
      date: '2026-08-01',
      ticker: 'VWCE.DE',
      description: '',
      type: 'buy',
      units: 10,
      price: 100,
      totalAmount: 0,
      accountId: 'acc-1',
    })
    expect(out.totalAmount).toBe(1000)
  })
})

describe('sanitizeBrokerAccount', () => {
  it('trims id/name and uppercases ticker', () => {
    const out = sanitizeBrokerAccount({
      id: ' b1 ',
      name: ' Trade Republic ',
      ticker: 'vwce.de',
      baseLumpSum: 1000,
      monthlyPacAmount: 200,
      interestRate: 2.5,
    })
    expect(out.id).toBe('b1')
    expect(out.name).toBe('Trade Republic')
    expect(out.ticker).toBe('VWCE.DE')
  })
})

describe('sanitizeCashAdjustment', () => {
  it('defaults notes to null', () => {
    const out = sanitizeCashAdjustment({
      id: 'c1',
      brokerId: 'b1',
      amount: 500,
      date: '2026-08-01',
    })
    expect(out.notes).toBeNull()
  })
  it('preserves notes when present', () => {
    const out = sanitizeCashAdjustment({
      id: 'c1',
      brokerId: 'b1',
      amount: 500,
      date: '2026-08-01',
      notes: 'refund',
    })
    expect(out.notes).toBe('refund')
  })
})

describe('sanitizeDividendEntry', () => {
  it('uppercases ticker', () => {
    const out = sanitizeDividendEntry({
      id: 'd1',
      brokerId: 'b1',
      ticker: 'vwce.de',
      amount: 10,
      date: '2026-08-01',
      type: 'dividend',
    })
    expect(out.ticker).toBe('VWCE.DE')
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npm test src/store/sanitization`
Expected: all sanitization tests pass (characterization of the round-trip to Firestore shape).

- [ ] **Step 5: Commit**

```bash
git add src/store/sanitization/transaction.test.ts src/store/sanitization/recurring.test.ts src/store/sanitization/investment.test.ts
git commit -m "test: sanitization unit tests (#127)"
```

---

## Task 5: Budget engine unit tests

**Files:**
- Test: `src/lib/budgetEngine.test.ts`

**Interfaces:**
- Consumes: `computeBudgetProgress`, `computeSavingsRate`, `computeBurnUpData`, `getPeriodDateRangeFromTarget` from `./budgetEngine`.
- Produces: passing tests for progress/status thresholds, savings rate, burn-up curve, and period date ranges. Budget functions use `dayjs()` when no `dateRange` is given; tests pass an explicit `dateRange` for determinism.

- [ ] **Step 1: Write the failing test**

```ts
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
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly' }],
      RANGE
    )
    expect(snapshots[0].status).toBe('breach')
    expect(snapshots[0].percentage).toBe(120)
    expect(snapshots[0].actualSpent).toBe(120)
  })

  it('flags target at 70–99% as warning', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 80 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly' }],
      RANGE
    )
    expect(snapshots[0].status).toBe('warning')
  })

  it('marks target under 70% as safe', () => {
    const { snapshots } = computeBudgetProgress(
      [tx({ category: 'Food', amount: 40 })],
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly' }],
      RANGE
    )
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
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly' }],
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
      [{ id: 't1', category: 'Food', targetAmount: 100, period: 'monthly' }],
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
    })
    expect(range.start).toMatch(/-\d{2}-01$/)
  })
})
```

- [ ] **Step 2: Run tests and verify they pass**

Run: `npm test src/lib/budgetEngine.test.ts`
Expected: PASS (characterization tests against existing implementation).

- [ ] **Step 3: Commit**

```bash
git add src/lib/budgetEngine.test.ts
git commit -m "test: budget engine unit tests (#127)"
```

---

## Task 6: Compound interest utils unit tests

**Files:**
- Test: `src/lib/compoundInterestUtils.test.ts`

**Interfaces:**
- Consumes: `computeCAGR`, `generateFinancialProjection` from `./compoundInterestUtils`.
- Produces: passing tests for the CAGR computation (clamp + null cases) and projection shape/math (rates, rounding, inflation).

- [ ] **Step 1: Write the failing test**

```ts
import { computeCAGR, generateFinancialProjection } from './compoundInterestUtils'

const snapshot = (overrides: Partial<import('../types/index').IPortfolioSnapshot>) => ({
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

  it('computes a positive CAGR and clamps to min 0', () => {
    const cagr = computeCAGR([
      snapshot({ date: '2025-01-01', totalInvested: 1000, currentValue: 1000 }),
      snapshot({ date: '2026-01-01', totalInvested: 1000, currentValue: 2000 }),
    ])
    expect(cagr).toBeGreaterThanOrEqual(0)
    expect(cagr).toBeCloseTo(1, 0)
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
      initialLumpSum: 0,
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
    const withInflation = generateFinancialProjection({
      years: 1,
      initialLumpSum: 0,
      annualInflow: 0,
      monthlyPac: 0,
      etfAnnualReturn: 0,
      cashAnnualRate: 0,
      adjustForInflation: true,
      inflationRate: 0.02,
    })
    const withoutInflation = generateFinancialProjection({
      years: 1,
      initialLumpSum: 0,
      annualInflow: 0,
      monthlyPac: 0,
      etfAnnualReturn: 0,
      cashAnnualRate: 0,
      adjustForInflation: false,
    })
    expect(withoutInflation[11].netWorth).toBe(0)
    expect(withInflation[11].netWorth).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests and verify they pass**

Run: `npm test src/lib/compoundInterestUtils.test.ts`
Expected: PASS. (Adjust `toBeCloseTo(1, 0)` assertion if exact value differs — the CAGR over exactly 1 year at 2x growth is the annual rate, clamped to `[0, 0.2]`, so a value near 1 is expected. If the observed value differs, inspect the actual output and align the assertion.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/compoundInterestUtils.test.ts
git commit -m "test: compound interest utils unit tests (#127)"
```

---

## Final Verification & Documentation

## Task 7: Full suite verification

**Files:**
- Modify: none (run commands only).

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Run production build (typecheck incl. tests)**

Run: `npm run build`
Expected: cleanup clean (TS 7 + Vite). The added `vitest/globals` and `@testing-library/jest-dom` types keep the build typecheck green.

- [ ] **Step 3: Run lint and confirm no new issues**

Run: `npm run lint`
Expected: same 19 problems (9 errors) as the 2026-08-06 baseline — no new ones. If any of the new test files appear in the report, fix before continuing.

- [ ] **Step 4: Commit the verification pass if anything changed**

```bash
git status --short
```
If clean, skip commit. Otherwise commit any lint fixes.

---

## Final Handoff

- PR description summary: Vitest runner + jsdom + setup; unit tests for validation (finance + investment), sanitization (transaction/recurring/investment), budget engine, and compound-interest utils; no behavior changes.
- After merge, comment on [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127) noting Phase 1 landed and Phases 2–4 (store actions, investment logic, components/sync) remain.
- Wiki documentation is handled as its own follow-up task on this branch (see repo AGENTS.md — YATF wiki workflow). Update `docs/YATF/raw/test-infrastructure/`, `wiki/features/test-infrastructure/`, `index.md`, `log.md`.