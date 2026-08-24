---
type: Feature
title: "Test Infrastructure (Vitest)"
description: "Layered Vitest test infrastructure with jsdom, colocated characterization tests, and mocked-Firebase strategy — Phase 1 (pure logic) complete."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/127"
tags: [feature, testing, quality]
created: 2026-08-24
updated: 2026-08-24
status: in-progress
sources: ["raw/test-infrastructure/test-infrastructure.md"]
related: ["wiki/architecture/testing-status", "wiki/conventions/testing-guide", "wiki/features/budget-savings-engine/budget-savings-engine", "wiki/features/financial-projections/financial-projections", "wiki/features/tax-inflation-modeling/tax-inflation-modeling", "wiki/decisions/typescript-7-upgrade"]
---

# Feature: Test Infrastructure (Vitest)

Status: in-progress (Phase 1 of 4 complete)
Priority: high

## Description

Test infrastructure so the app can keep evolving without manually re-checking the same flows. Layered and incremental: each phase lands independently on issue [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127).

## Requirements

- Vitest ^4 runner reusing the installed Vite 8 toolchain; standalone `vitest.config.ts`
- jsdom environment, `globals: true`, shared setup in `src/test/setup.ts`
- Tests colocated as `<file>.test.ts(x)` next to the module under test
- Firebase SDK always mocked (`vi.mock`) — fast, no emulator, no network
- Local-only execution (no CI in scope yet)

## Phase Roadmap

| Phase | Scope | Status |
|-------|-------|--------|
| 1 — Pure logic | Validation, sanitization, budget engine, compound interest | ✅ landed (61 tests / 7 files) |
| 2 — Store actions | Mocked Firestore SDK + fake doc/collection layer; transaction/recurring CRUD, category rename/remap, multi-account migration | ⬜ |
| 3 — Investment logic | Pure calc tests, then `useInvestmentStore` actions | ⬜ |
| 4 — Components & sync hooks | React Testing Library, i18n+MUI wrappers, snapshot listeners | ⬜ deferred |

## Implementation Notes

- **TS 7 quirk:** `tsc -b` typechecks all of `src/` including test files → ambient types `vitest/globals` + `@testing-library/jest-dom` added to `tsconfig.app.json`; `vitest.config.ts` typechecked via `tsconfig.node.json`.
- **Characterization-first:** tests pin existing behavior; every plan-literal deviation exposed a real implementation fact (PAC cash-cap via `Math.min(monthlyPac, currentBrokerCash)`, required `BudgetTarget` fixture fields).
- **Tautology fix (user-sanctioned):** the planned inflation test asserted `0 === 0`; rewritten to exact deflated values (1200 → 1176 = `round(1200/1.02)`) so it can fail on regression.
- **Lint gotcha:** bare `npx eslint <file>` crashes on TS (TS7/TS6 override issue) — use the project lint script or `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs'`.
- Deferred minors recorded in the raw source: band-edge boundaries (100%/70%), NaN pass-through, lower CAGR clamp, `monthOfYear: 0` truthiness drop.

## Related

- [[wiki/conventions/testing-guide]] — how to use this infrastructure day-to-day
- [[wiki/architecture/testing-status]] — superseded "no test suite exists" analysis
- [[wiki/features/budget-savings-engine/budget-savings-engine]] — budgetEngine under test
- [[wiki/features/financial-projections/financial-projections]] — projection engine under test
- [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]] — inflation adjustment verified by the fixed test
- [[wiki/decisions/typescript-7-upgrade]] — TS7 build/typecheck constraints that shaped config
- Source: [raw/test-infrastructure/test-infrastructure.md](raw/test-infrastructure/test-infrastructure.md)
