---
type: Architecture
title: "Store Architecture"
description: "Zustand stores and the domain modules extracted from the monolithic finance store — types, validation, sanitization, defaults, backup and sync — plus what the 2026 refactor did not finish."
tags: [architecture, state, zustand, refactor]
created: 2026-10-26
updated: 2026-10-26
status: active
sources: ["raw/archive/superpowers/2026-05-03-store-refactor-design.md", "raw/archive/superpowers/2026-05-03-store-refactor-plan.md"]
related: ["wiki/architecture/system-architecture", "wiki/architecture/codebase-structure", "wiki/conventions/testing-guide", "wiki/architecture/project-state"]
---

# Store Architecture

Analysis: 2026-10-26

## Stores

| Store | Responsibility |
|---|---|
| `useFinanceStore` | Transactions, accounts, cards, categories, recurring items, car/utility data, import/export |
| `useInvestmentStore` | Brokers, holdings, ETF transactions, dividends, capital gains, cash adjustments |
| `useBudgetStore` | Budget targets and the savings-rate engine |
| `useAuthStore` | Firebase user session |
| `useUiStore` | UI-only state (sidebar, dialogs) |
| `useProjectionSettingsStore` | Inflation/tax parameters for the projections simulator |

All are Zustand stores; the finance, investment and budget stores persist through
Firestore sync hooks rather than `persist` middleware.

## Extracted modules

The 2026-05-03 refactor (issue #46) took the 1,403-line `useFinanceStore.ts` and
pulled out cohesive, testable units:

```
apps/web/src/store/
├── types/              finance.types.ts · budget.types.ts · investment.types.ts · projection.types.ts
├── validation/         finance.validation.ts · investment.validation.ts   (+ tests)
├── sanitization/       transaction.ts · recurring.ts · investment.ts       (+ tests)
├── defaults.ts         default categories, accounts, modules
├── backup/             export/import payload assembly
├── sync/               Firestore snapshot wiring (incl. recurring generation guard)
└── useFinanceStore.ts  composes the above
```

`useFinanceStore.ts` re-exports `Types`, `Validation` and `Sanitization` so
existing imports keep working; `validation/` and `sanitization/` carry their own
unit tests and are the cheapest place to add coverage.

## What the refactor did *not* finish

The original design proposed a full domain-module split (`modules/transactionModule.ts`,
`accountModule.ts`, `recurringModule.ts`, …) composed into a single store, with
`useFinanceStore.ts` reduced to a thin re-export.

That part never shipped. `useFinanceStore.ts` is still a large monolithic store
(~1.5k lines at the time of writing) that imports the extracted modules rather
than delegating to domain slices. The practical consequences:

- Extracted helpers are testable, but the store's action surface is not.
- The file still owns Firestore orchestration for several domains at once.
- Bundle-splitting benefits the design promised are not available.

Treat the design document as the **target**, not as a description of the current
state. Any further work here should start from the store's action list and split
one domain at a time, keeping the public hook API stable.

## Testing

Store tests run against the real store with Firestore mocked at the module
boundary (`vi.mock('../../lib/firebase')`), using `useFinanceStore.getState()` /
`useInvestmentStore.getState()` to invoke actions directly. See
[[wiki/conventions/testing-guide]] for the pattern and gotchas.

## Related

- [[wiki/architecture/system-architecture]]
- [[wiki/architecture/codebase-structure]]
- [[wiki/conventions/testing-guide]]
- [[wiki/architecture/project-state]]
- Archived design: [store-refactor-design](../../raw/archive/superpowers/2026-05-03-store-refactor-design.md), [plan](../../raw/archive/superpowers/2026-05-03-store-refactor-plan.md)
- Issue: [#46](https://github.com/AlexDevsTheWeb/myfinance/issues/46)
