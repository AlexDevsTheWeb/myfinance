---
type: Query
description: "Comprehensive app audit: strengths, weaknesses, architecture anti-patterns, and improvement suggestions."
title: "Full App Review — MyFinance (YAFT)"
tags: [query, review, audit, architecture]
created: 2026-07-11
updated: 2026-07-11
status: active
sources: ["raw/app-review/app-review.md"]
related: ["wiki/plans/go-to-market", "wiki/decisions/saas-readiness", "wiki/architecture/concerns-and-tech-debt", "wiki/architecture/project-state", "wiki/architecture/system-architecture"]
---

# App Review: MyFinance (YAFT)

> A comprehensive audit of the webapp's functionalities, strengths, weaknesses, and improvement areas.
> Tech: React 19 + TypeScript 7 + Vite 8 + MUI 9 + Zustand 5 + Firebase 12 + i18next.

## Strengths

- **Comprehensive scope** — covers transactions, budgets, investments, car, utilities, projections in one app
- **Real-time sync** — Firestore `onSnapshot` listeners provide instant cross-device consistency
- **Investment tracking** — real market prices via YFinance, PAC automation, dividend tracking, cost basis, historical snapshots — rare in personal finance apps
- **Rich analytics** — self-contained `src/analytics/` module with composable hooks and chart components
- **Full i18n** — Italian + English with day.js locale sync
- **Polished dark theme** — MUI dark theme with glassmorphism aesthetics
- **Drag-and-drop** — category management with @dnd-kit
- **Backup/restore** — comprehensive JSON export/import with validation and preview
- **Budget features** — bullet charts, burn-up lines, comparison bars, savings rate gauge
- **TypeScript throughout** — strong typing across stores, sync, validation, analytics

## Weaknesses

### Data Model & Performance
- Single Firestore doc per user — 1 MiB limit risk
- Every write rewrites the entire document (array operations)
- No pagination — all data loaded in memory
- No server-side search/filter
- No data aggregation layer

### Architecture Anti-Patterns
- Zustand God Store — `useFinanceStore` ~1250 lines
- Firestore array full rewrite on every mutation
- Cross-store `getState()` coupling
- Migration code runs on every load (no run-once guard)
- Duplicate portfolio computation in 3 locations
- `any` types in 19 files

### Quality & Testing
- Zero test suite — no dependencies, no config, no tests
- No error boundary — render crash = white screen
- No loading/empty states
- Oversized components: ConfigPage (~1054 lines), CarPage (~695 lines)
- `alert()`/`confirm()` instead of MUI dialogs

### Security
- Firestore rules lack field-level validation
- Missing env vars crash the app at startup

### Dependencies at Risk
- `@dnd-kit/sortable` v10 vs core v6 — version mismatch
- `standard-version` ^9.5.0 — deprecated
- `@mui/x-date-pickers-pro` — requires commercial license
- Tight Firebase coupling — no abstraction layer

## Improvements Suggested

### Data Layer
- Sub-collections for transactions
- Server-side aggregation (materialized monthly/yearly views)
- Per-collection Firestore listeners
- IndexedDB offline cache

### Features
- Bank import (CSV/OFX/QIF)
- Split transactions
- Goal-based / envelope budgeting
- Multi-currency
- Receipt attachment
- Push notifications
- Shared/family accounts

### Quality
- Test suite (Vitest + Testing Library)
- CI/CD pipeline
- Error boundaries
- Performance monitoring

### UX
- Mobile responsiveness
- Onboarding flow
- Undo/redo for destructive ops
- Keyboard shortcuts

## Project History

The app evolved through:
- **Phase 10**: Investment V1 — Single broker, single ETF
- **Phase 12**: Investment V2 — Multi-broker, PAC, snapshots, inflation toggle
- **Phase 13**: Investment V3 — Dividends, 26% tax, cash adjustments, CAGR prefill
- **Phase 14**: Budget & Savings Engine
- **Phase 15**: Dashboard redesign + collapsible sidebar
- **Post-15**: Backup data coverage fix, user-configurable rates

## Key Decisions

- **TS 7.0 Go-rewrite** — adopted July 2026 for ~10x faster type-checking
- **MUI X Charts migration** — 16 charts migrated from Recharts to MUI X Charts, ~200KB removed

## Known Fixed Bugs

- Car statistics year display — i18next `{{variable}}` vs `{variable}` syntax
- Ticker persistence (critical) — `BrokerAccount` missing `ticker` field

## References

- Source: [raw/app-review/app-review.md](raw/app-review/app-review.md)
- Decision: [[wiki/decisions/saas-readiness]]
- Plan: [[wiki/plans/go-to-market]]
