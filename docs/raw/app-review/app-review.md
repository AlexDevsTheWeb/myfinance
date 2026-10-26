# MyFinance (YAFT) — App Review

> A personal finance tracking web app for managing income, expenses, investments, budgets, vehicle mileage, and utility bills.
> Tech: React 19 + TypeScript 7 + Vite 8 + MUI 9 + Zustand 5 + Firebase 12 + i18next.

---

## What It Does

| Area | Capabilities |
|---|---|
| **Transactions** | Full CRUD for income/expense/transfer entries; rich filtering (search, date range, category, subcategory); sorting & pagination |
| **Multi-Account** | Multiple named accounts with initial balances; default account flag; real-time balance tracking |
| **Categories** | Hierarchical expense & income trees; drag-and-drop subcategory reordering; safe-delete with remap to existing transactions |
| **Recurring** | Monthly/yearly templates; auto-generation engine backfills missed transactions; deleted-instance tracking prevents re-creation |
| **Dashboard** | Stats cards (balance, income, expense, cash flow); portfolio line chart; budget gauge; savings rate; mileage alerts |
| **Investments** | ETF portfolio with cost basis, market prices (via YFinance API), holdings table, allocation donut chart; multi-broker accounts with PAC automation; dividend & interest tracking; historical portfolio snapshots |
| **Projections** | Compound interest calculator; configurable rates, inflation adjustment, real CAGR; monthly net-worth-vs-invested chart |
| **Budget** | Per-category targets (monthly/semiannual/annual); bullet charts, burn-up charts, comparison bars; savings rate gauge + summary metrics (daily burn, projected overshoot) |
| **Car** | Monthly mileage tracking with year-over-year comparison; tire change logging; fuel efficiency (€/km) from fuel transactions |
| **Utilities** | Electricity (kWh) & gas (smc) bill tracking; dual-axis consumption/unit-cost charts; year filtering |
| **Salary** | Filters salary transactions; year-over-year monthly comparison table + trend chart |
| **Insights** | Category pie/bar charts; monthly comparisons; net worth over time; account breakdown; financial trend charts; configurable granularity |
| **Configuration** | 7-tab settings: language, module toggles, accounts, expense/income categories (drag-drop), recurring templates, projection rates, backup/restore |
| **Backup/Restore** | Full JSON export/import with validation, preview dialog, and schema checks |
| **Auth** | Firebase Auth (Google OAuth + email/password); protected routes; real-time auth listener |
| **i18n** | Italian & English; day.js locale sync; full UI translation |
| **Real-time Sync** | Firestore `onSnapshot` listeners keep all stores in sync across devices |

---

## Strengths

- **Comprehensive scope** — covers nearly every personal finance need in one app (transactions, budgets, investments, car, utilities, projections)
- **Real-time sync** — Firestore listeners provide instant cross-device data consistency without manual refresh
- **Offline-resilient data model** — single-document Firestore design simplifies sync; Zustand stores act as local cache
- **Well-architected state** — Zustand stores are cleanly separated (finance, investments, budget, auth, projections); validation and sanitization layers keep data integrity
- **Investment tracking is genuinely useful** — real market prices via YFinance, PAC automation, dividend tracking, cost basis, historical snapshots — rare in personal finance apps
- **Rich analytics** — the `src/analytics/` module is a self-contained sub-app with composable hooks and chart components
- **Internationalization** — full i18next setup with two locales; easy to extend
- **Dark theme** — polished MUI dark theme with glassmorphism aesthetics
- **Drag-and-drop UX** — category management with @dnd-kit is smooth
- **Backup/restore** — comprehensive export/import with preview and validation; user-owned data
- **Budget features are well-executed** — bullet charts, burn-up lines, comparison bars, savings rate gauge
- **TypeScript throughout** — strong typing across stores, sync, validation, analytics

---

## Weaknesses & Risks

### Data Model & Performance
- **Single Firestore document per user** — as data grows, the `users/{uid}` document becomes a bottleneck. Firestore documents have a **1 MiB limit**; a user with 5+ years of transactions + investments + mileage could approach or exceed this.
- **Every write rewrites the entire document** — updating one transaction triggers `updateDoc` on the whole user doc via array operations. Inefficient and wastes Firestore write quota.
- **No pagination for Firestore reads** — all transactions are loaded into memory on every page load. Performance will degrade with thousands of transactions.
- **No server-side search/filter** — all filtering and sorting happens client-side in JavaScript after loading everything.
- **No data aggregation layer** — charts and analytics recompute everything from raw transactions every time; no materialized views or caching.

### Architecture Anti-Patterns
- **Zustand God Store** — `useFinanceStore` at ~1250 lines violates SRP. Types, validation, sanitization, and defaults have been partially extracted, but the store remains monolithic.
- **Firestore array full rewrite** — mutations replace entire arrays instead of using targeted field updates via subcollections.
- **Cross-store `getState()` coupling** — stores reach into each other directly instead of using a clean event bus or middleware.
- **Migration code runs on every load** — no run-once guard, so migration logic executes unnecessarily on every page visit.
- **Duplicate portfolio computation** — portfolio math exists in 3 separate locations instead of one shared utility.
- **`any` types in 19 files** — 19 files have file-level `no-explicit-any` suppression (#126).

### Quality & Testing
- **No test suite** — zero tests. No unit, integration, or E2E coverage for any of the 30+ components, stores, or hooks. No test dependencies installed (#127).
- **No error boundary** — a rendering crash causes a white screen with no fallback UI.
- **No loading or empty states** — many pages render blank or partially broken before data arrives.
- **Oversized components** — `ConfigPage` (~1054 lines) and `CarPage` (~695 lines) are overdue for decomposition (#123, #124).
- **`alert()`/`confirm()` instead of MUI dialogs** — native browser dialogs in ConfigPage break the UI experience (#137).

### Security
- **Firestore rules lack field-level validation** — sensitive financial data relies entirely on Firebase Auth UID matching; no type/range validation at the database level (#129).
- **Env var crash** — missing `VITE_FIREBASE_*` env vars cause the app to throw at startup instead of showing a graceful error (#130).

### Dependencies at Risk
- **`@dnd-kit/sortable` v10 vs core v6** — version mismatch between the sortable and core packages.
- **`standard-version` ^9.5.0** — deprecated and unmaintained.
- **`@mui/x-date-pickers-pro`** — requires a commercial MUI license.
- **Tight Firebase coupling** — no abstraction layer around Firestore, making migration difficult.

### Other
- **YFinance API has no rate limiting or fallback** — market data fetching could silently fail if the API throttles or changes.
- **PAC automation uses localStorage** — browser-local state tracking for auto-generated buys means clearing browser data loses the automation trail.
- **Dead route** — `/analysis` is a redirect to `/insights` (leftover from sidebar refactor).
- **No export formats besides JSON** — no CSV, PDF, or bank-statement-compatible export.
- **Single-user architecture** — no multi-user, family sharing, or advisor access patterns.
- **Italian bias** — default locale is Italian; category names, car subcategories ("Carburante"), and utility types assume Italian context.

---

## What Could Be Improved

### Data Layer
- **Sub-collections for transactions** — move transactions to a `users/{uid}/transactions/{txnId}` sub-collection to avoid the 1 MiB doc limit and enable paginated queries.
- **Server-side aggregation** — maintain precomputed monthly/yearly aggregates in a separate doc to speed up dashboard and chart loads.
- **Real-time per-collection listeners** — listen to sub-collections instead of the whole user doc to reduce bandwidth and write contention.
- **IndexedDB offline cache** — add local persistence so the app works offline and syncs when connectivity returns.

### Performance
- **Virtual scrolling** for transaction lists — replace pagination with a virtualized list (e.g., TanStack Virtual) for smooth scrolling through thousands of rows.
- **Lazy-loaded analytics** — defer heavy chart computations to Web Workers or compute only when the tab is visible.

### Features
- **Bank import** — add CSV/OFX/QIF import from bank statements to avoid manual entry.
- **Split transactions** — allow a single transaction to be split across multiple categories.
- **Recurring transaction execution** — instead of auto-generating past transactions, allow "execute on date" with approval workflow.
- **Goal-based budgeting** — envelope budgeting or zero-based budgeting mode alongside the current target-based system.
- **Multi-currency** — support for foreign currency transactions with exchange rate tracking.
- **Receipt attachment** — store receipt images/photos per transaction (Firebase Storage).
- **Notifications** — push notifications for upcoming bills, budget limits, or investment price alerts.
- **API layer** — extract a backend API (Firebase Functions or separate service) to handle computation-heavy operations server-side.
- **Shared/family accounts** — shared budgets, shared visibility into household finances.

### Quality
- **Test suite** — at minimum: store unit tests, hook integration tests, critical path E2E tests (Cypress/Playwright).
- **CI pipeline** — run typecheck, lint, and tests on every PR.
- **Error boundaries** — catch rendering errors gracefully instead of white screens.
- **Performance monitoring** — track Firestore doc size, read/write counts, and client-side computation time.

### UX
- **Mobile responsiveness** — the current layout is desktop-first; mobile navigation and touch interactions need work.
- **Onboarding flow** — first-time users land on a blank dashboard with no guidance.
- **Undo/redo** for destructive operations (delete transaction, delete category with remap).
- **Keyboard shortcuts** — power-user shortcuts for common operations (add transaction, search, navigate).

---

## Planned Features (from Wiki Roadmap)

| Feature | Priority | Summary |
|---|---|---|
| **Car Management Redesign** | Medium | Bento grid layout, monthly averages, historical stats, redesigned Mileage/Tires/Fuel tabs |
| **Transaction Layout Improvement** | Medium | Two-column 4/8 layout, compact filters + pie chart on left, table on right |
| **Italian Tax Enhancements** | Medium | Per-ticker pricing, 0.20% stamp duty, capital losses tracking (zainetto fiscale), transaction fees, privacy mode |
| **Backup & Restore Refinements** | Low | Phase 05 on roadmap — no spec yet |
| **UI Layout Refinement** | Low | Phase 07 on roadmap — no spec yet |

---

## Project History & Key Decisions

### Evolution
- **Investment V1 (Phase 10):** Single broker, single ETF, basic tracking
- **Investment V2 (Phase 12):** Multi-broker, multi-asset, PAC automation, historical snapshots, inflation toggle
- **Investment V3 (Phase 13):** Dividends/interest, 26% capital gains tax, cash adjustments, CAGR prefill
- **Budget & Savings Engine (Phase 14):** Per-category targets, bullet/burn-up/comparison charts, savings rate gauge
- **Dashboard Redesign & Sidebar (Phase 15):** Collapsible sidebar, account detail dialog, conditional charts, stat cards
- **Backup Data Coverage:** Extended export/import for budget targets, broker accounts, asset holdings, cash adjustments, dividends
- **User-Configurable Rates:** Replaced hardcoded 2% inflation / 26% tax with per-user settings

### Key Decisions
- **TypeScript 7.0 Go-Rewrite (July 2026):** Adopted TS 7.0 "Corsa" for ~10x faster type-checking. Workaround uses `@typescript/typescript6` for ESLint compatibility until TS 7.1 ships.
- **MUI X Charts Migration (July 2026):** All 16 chart components migrated from Recharts to MUI X Charts. Recharts (~130KB) + victory-vendor (~70KB) removed. Colors now from MUI theme tokens instead of hardcoded.

### Known Fixed Bugs
- **Car statistics year display** — i18next `{{variable}}` vs `{variable}` syntax mismatch (fixed)
- **Ticker persistence (critical)** — `BrokerAccount` interface missing `ticker` field; PAC automation used broker ID as ticker symbol (fixed, existing accounts need manual re-entry)

---

## Conventions

- **Branch strategy:** Never commit to `development`/`main`. Branch as `feat/YATF-{n}` or `fix/YATF-{n}`. PR to `development`. Conventional commits required.
- **Coding:** PascalCase with `I`-prefix for interfaces, camelCase for hooks/stores, `UPPER_SNAKE_CASE` for constants. Strict TypeScript with `verbatimModuleSyntax`. ESLint v10 flat config.
- **Wiki discipline:** Every decision, plan, and bug analysis is documented in `docs/YATF/wiki/` following the LLM Wiki (Karpathy) pattern.

---

## Summary

MyFinance is an impressively **comprehensive** and **well-architected** personal finance tool for a solo developer's project. The investment tracking, budget analytics, and real-time sync features rival many commercial apps. The main technical risk is the **single-document Firestore model** — it works now but won't scale with years of data. Adding tests and addressing the data model bottleneck would make this production-ready.
