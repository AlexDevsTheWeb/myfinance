# Test Infrastructure with Vitest — Phase 1 Execution Record

- **Date:** 2026-08-06 → 2026-08-24
- **Issue:** [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127)
- **Branch:** `feat/YATF-127-test-infra` (11 commits, base `76e4f78`, head `0a78fcb`)
- **Design:** `docs/superpowers/specs/2026-08-06-test-infrastructure-design.md` (approved)
- **Plan:** `docs/superpowers/plans/2026-08-06-test-infrastructure.md` (Phase 1 of 4)
- **Execution method:** Subagent-Driven Development (fresh implementer + independent task reviewer per task; progress ledger in `.superpowers/sdd/progress.md`)

## What Landed

| Commit | Content |
|--------|---------|
| `56a5da0` | Approved design doc (Vitest ^4, jsdom, mock-Firebase strategy, 4-phase roadmap) |
| `c544963` | Phase 1 implementation plan (7 tasks) |
| `2ddce5b` | Pre-flight plan fix: Task 6 CAGR assertion corrected to `toBe(0.2)` |
| `8ed2803` | Vitest config, jsdom env, globals, `src/test/setup.ts`, test scripts |
| `7e53192` | Typecheck `vitest.config.ts` via `tsconfig.node.json` include |
| `c2a13a9` | Finance validation tests (9) |
| `aca0a33` | Investment validation tests (17) |
| `6b6e915` | Sanitization tests — transaction/recurring/investment (16) |
| `ef5f0b9` | Budget engine tests (11) |
| `f004b86` | Compound interest utils tests (8) |
| `0a78fcb` | Fix: inflation-adjustment tautology rewritten to falsifiable exact-value assertions |

**Final state:** 61 tests / 7 files, all green. `npm run build` green. `npm run lint` at exact baseline (19 problems / 9 errors — zero new). Zero production source changes.

## Necessary Deviations from Plan-Literal Code (all verified behavior-neutral)

1. **Task 5 — `BudgetTarget` fixtures** required `color`/`createdAt`/`updatedAt` (TS2739). Engine never reads these fields (`budgetEngine.ts` has no references).
2. **Task 6 — type import path** `../types/index` does not exist; corrected to `../store/types` (matches module's own import).
3. **Task 6 — PAC funding**: plan's projection test used `initialLumpSum: 0` with `monthlyPac: 100`, but PAC is cash-capped (`Math.min(monthlyPac, currentBrokerCash)`), so month-1 transfer would be 0 and the verbatim assertion unreachable. Funded with `initialLumpSum: 1200`.

## User-Sanctioned Fix (plan-mandated defect)

The plan's inflation test was **tautological**: both projections unfunded → all values 0 → `0 === 0` passes even if inflation adjustment is broken. User chose "fix". Rewritten to fund both runs identically and assert exact values: `withoutInflation[11].netWorth === 1200`, `withInflation[11].netWorth === 1176` (= `round(1200 / 1.02)` via monthly-compounded deflator at `compoundInterestUtils.ts:72-85`), plus strict `<` ordering.

## Review Findings — Deferred Minors (Phase-1 scope, candidates for later hardening)

- Validation breadth: non-numeric→NaN pass-through, missing date/category/subcategory, negative ETF amount, lower CAGR clamp (`Math.max(0, …)`), `endDate: null` branch.
- Budget band edges: exactly 100% / 70% boundaries untested; `getPeriodDateRangeFromTarget` underasserted (any-month regex, `.end` unchecked).
- Sanitization quirk worth an issue someday: `monthOfYear: 0` dropped even for yearly recurring (truthiness check).
- Ticker-format error asserted via `stringContaining` instead of exact string.
- Rounding path (`Math.round` on fractional values) untested in projections.

## Process Notes

- Bare `npx eslint <file>` crashes on TS files (pre-existing TS7/TS6 override issue); use project lint script / `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'`.
- TS7 gotcha confirmed in practice: `tsc -b` typechecks ALL of `src/` including `*.test.ts` — ambient types (`vitest/globals`, jest-dom) live in `tsconfig.app.json`; config file needs explicit inclusion in `tsconfig.node.json`.
- Characterization-first approach worked well: every deviation surfaced a real fact about the implementation (cash-capped PAC, required fixture fields) rather than masking bugs.
- Final whole-branch independent review could not run due to subagent-provider outage; controller performed inline branch-level pass (commit hygiene, diff surface = tests/config/docs only, config-vs-design conformance, minors triage). Re-run before PR if desired.
