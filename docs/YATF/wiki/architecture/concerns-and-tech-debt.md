---
title: "Codebase Concerns and Tech Debt"
tags: [architecture, tech-debt, bugs, security, performance]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/CONCERNS.md"]
related: ["architecture/project-state", "architecture/testing-status", "architecture/system-architecture"]
---

# Codebase Concerns and Tech Debt

*Analysis: 2026-07-11*

## Technical Debt

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| Monolithic Zustand store (~1250 lines) | `src/store/useFinanceStore.ts` | High | [#122](https://github.com/AlexDevsTheWeb/myfinance/issues/122) |
| Oversized ConfigPage (~1054 lines) | `src/pages/ConfigPage.tsx` | High | [#123](https://github.com/AlexDevsTheWeb/myfinance/issues/123) |
| Oversized CarPage (~695 lines) | `src/pages/CarPage.tsx` | Medium | [#124](https://github.com/AlexDevsTheWeb/myfinance/issues/124) |
| Duplicate portfolio computation (3x) | `useInvestmentStore`, `useHistoricalSnapshots`, `usePortfolio` | Medium | [#125](https://github.com/AlexDevsTheWeb/myfinance/issues/125) |
| `any` types in 19 files | `src/pages/`, `src/lib/`, `src/components/`, `src/store/sanitization/` | Medium | [#126](https://github.com/AlexDevsTheWeb/myfinance/issues/126) |
| Missing test suite | Entire project | High | [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127) |
| Duplicate sync hooks with race conditions | `useSyncFinance`, `useInvestmentSync`, `useBudgetSync` | High | [#128](https://github.com/AlexDevsTheWeb/myfinance/issues/128) |

## Security Considerations

| Issue | Location | Severity | Issue |
|-------|----------|----------|-------|
| Firestore rules lack field-level validation | `firestore.rules` | Medium | [#129](https://github.com/AlexDevsTheWeb/myfinance/issues/129) |
| Env var crashes app on missing | `src/utils/variables.utils.tsx` | Low | [#130](https://github.com/AlexDevsTheWeb/myfinance/issues/130) |
| `VITE_REACT_APP_TITLE` undocumented | `AGENTS.md` | Low | [#130](https://github.com/AlexDevsTheWeb/myfinance/issues/130) |
| Unused subcollection rules in firestore.rules | `firestore.rules` | Low | [#129](https://github.com/AlexDevsTheWeb/myfinance/issues/129) |

## Performance Bottlenecks

| Issue | Cause | Severity | Issue |
|-------|-------|----------|-------|
| All data loaded in memory | No pagination, single `users/{userId}` doc | Medium | [#131](https://github.com/AlexDevsTheWeb/myfinance/issues/131) |
| Inefficient Firestore write pattern | Full-array rewrite on every mutation | Medium | [#131](https://github.com/AlexDevsTheWeb/myfinance/issues/131) |
| Static date range memo | `useMemo([], [])` in DashboardPage | Low | [#132](https://github.com/AlexDevsTheWeb/myfinance/issues/132) |

## Fragile Areas

| Issue | Location | Severity | Issue |
|-------|----------|----------|-------|
| Backup/import reliability | `importAllData` — single `updateDoc` with no transaction | High | [#133](https://github.com/AlexDevsTheWeb/myfinance/issues/133) |
| Fire-and-forget subcollection writes | `recordPortfolioSnapshot` with no retry | Medium | [#134](https://github.com/AlexDevsTheWeb/myfinance/issues/134) |
| Migration code runs on every load | `migrateBrokerConfig` in `useInvestmentSync` | Medium | [#135](https://github.com/AlexDevsTheWeb/myfinance/issues/135) |
| PAC tracking uses localStorage | `usePacAutomation` — doesn't sync across devices | Medium | [#136](https://github.com/AlexDevsTheWeb/myfinance/issues/136) |
| `alert()`/`confirm()` instead of MUI | ConfigPage | Low | [#137](https://github.com/AlexDevsTheWeb/myfinance/issues/137) |

## Missing Critical Features

| Feature | Issue |
|---------|-------|
| Error Boundary | No React `<ErrorBoundary>` — crash = white screen |
| Offline Support | Firestore `enableMultiTabIndexedDbPersistence()` not configured |
| Loading/Empty States | No skeleton loaders or empty state messages in most pages |
| AnalysisPage dead redirect | `/analysis` redirects to `/insights` but no route exists |
| Empty `src/context/` directory | Dead boilerplate |
| Commented-out code in LoginPage | Console.log and alert artifacts |

## Scaling Limits

- **Firestore 1 MiB doc limit** — single `users/{userId}` doc with all user data
- **No pagination** — entire document loaded into memory
- **No offline support** — all operations require network
- **In-memory state** — all data in Zustand stores

## Dependencies at Risk

- **@dnd-kit/sortable v10 vs core v6** — major version mismatch
- **standard-version ^9.5.0** — deprecated, no active maintenance
- **@mui/x-date-pickers-pro** — requires commercial license
- **Firebase SDK** — tight coupling, no abstraction layer

## Related

- [[wiki/architecture/project-state]]
- [[wiki/architecture/testing-status]]
- [[wiki/architecture/system-architecture]]
- [[wiki/plans/go-to-market]] — includes phased plan to address the top blockers
- [[wiki/decisions/saas-readiness]] — hard blockers vs ship-as-is breakdown
