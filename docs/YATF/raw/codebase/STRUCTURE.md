# Codebase Structure

**Analysis Date:** 2026-07-11

## Directory Layout

```
myfinance/
├── index.html                        # Vite HTML entry point
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # Root TS config (project references)
├── tsconfig.app.json                 # App TS config (references tsconfig.node.json)
├── tsconfig.node.json                # Node/Vite TS config
├── package.json
├── AGENTS.md                         # Dev notes, commands, workflow rules
├── firestore.rules                   # Firestore security rules
├── clear_auth.html                   # Auth clearing helper
│
├── .env                              # NOT READ (contains Firebase env vars)
├── .env.production                   # NOT READ (production env vars)
│
├── scripts/
│   └── fix-tsc-bin.js                # postinstall script for TS 7 binary fix
│
├── src/
│   ├── main.tsx                      # 🔤 React entry point, providers setup
│   ├── App.tsx                       # 🔤 Router, ProtectedRoute, global sync hooks
│   ├── App.css
│   ├── index.css
│   ├── version.ts                    # Auto-generated version info
│   │
│   ├── pages/                        # 📄 Route page components (13 total)
│   │   ├── LoginPage.tsx             #   / — Google OAuth + email/password
│   │   ├── DashboardPage.tsx         #   /dashboard — Main overview
│   │   ├── TransactionsPage.tsx      #   /transactions — Transaction list + filters
│   │   ├── FinancePage.tsx           #   /finance — Tabs: Salary + Insights
│   │   ├── InvestmentsPage.tsx       #   /investments — Tabs: Investment + Projections
│   │   ├── BudgetPage.tsx            #   /budget — Budget tracking
│   │   ├── ConfigPage.tsx            #   /config — Settings, categories, backup/restore
│   │   ├── CarPage.tsx               #   /car — Car mileage + tire tracking
│   │   ├── UtilitiesPage.tsx         #   /utilities — Utility bill tracking
│   │   ├── AnalysisPage.tsx          #   /analysis — Legacy redirect to /insights
│   │   ├── InsightsPage.tsx          #   Nested under /finance tab — Analytics/charts
│   │   ├── SalaryPage.tsx            #   Nested under /finance tab — Salary tracking
│   │   ├── InvestmentPage.tsx        #   Nested under /investments tab — ETF tracking
│   │   └── ProjectionsPage.tsx       #   Lazy loaded under /investments tab — Projections
│   │
│   ├── components/                   # 🧩 Reusable UI components (by domain)
│   │   ├── layout/
│   │   │   ├── Layout.tsx            #   App shell: AppBar, Sidebar, Breadcrumbs, FAB
│   │   │   └── Sidebar.tsx           #   Navigation drawer (collapsible, module-aware)
│   │   ├── dashboard/
│   │   │   ├── AccountCard.component.tsx
│   │   │   ├── AccountDetailDialog.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── RecapCards.tsx
│   │   │   └── TransactionTable.tsx
│   │   ├── budget/
│   │   │   ├── BulletChart.tsx
│   │   │   ├── BudgetTargetDialog.tsx
│   │   │   ├── BudgetSummaryCards.tsx
│   │   │   ├── BurnUpLineChart.tsx
│   │   │   ├── ComparisonBarChart.tsx
│   │   │   └── SavingsRateGauge.tsx
│   │   ├── investment/               #   13 investment-related components
│   │   │   ├── AllocationDonutChart.tsx
│   │   │   ├── BrokerSelect.tsx
│   │   │   ├── BrokerSettingsModal.tsx
│   │   │   ├── CashAdjustmentDialog.tsx
│   │   │   ├── CashInterestCard.tsx
│   │   │   ├── DividendBadge.tsx
│   │   │   ├── DividendDialog.tsx
│   │   │   ├── EtfTransactionForm.tsx
│   │   │   ├── EtfTransactionModal.tsx
│   │   │   ├── HoldingsTable.tsx
│   │   │   ├── PacConfirmationDialog.tsx
│   │   │   ├── PortfolioLineChart.tsx
│   │   │   ├── PortfolioStats.tsx
│   │   │   └── TaxPocketWidget.tsx
│   │   ├── analysis/
│   │   │   ├── AnalysisTables.tsx
│   │   │   └── FinancialTrendChart.tsx
│   │   ├── projections/
│   │   │   ├── ProjectionChart.tsx
│   │   │   ├── ProjectionControls.tsx
│   │   │   ├── ProjectionSummary.tsx
│   │   │   └── ProjectionsHeader.tsx
│   │   ├── forms/
│   │   │   └── TransactionForm.tsx
│   │   ├── modals/
│   │   │   └── TransactionModal.tsx
│   │   ├── common/
│   │   │   ├── YearSelector.component.tsx
│   │   │   └── VersionFooter.tsx
│   │   └── TransactionError.tsx       #   Global error snackbar
│   │
│   ├── store/                        # 🗄️ Zustand state management
│   │   ├── useFinanceStore.ts        #   Core finance store (1200+ lines)
│   │   ├── useInvestmentStore.ts     #   Investment store (585 lines)
│   │   ├── useBudgetStore.ts         #   Budget store (100 lines)
│   │   ├── useAuthStore.ts           #   Auth store (11 lines)
│   │   ├── useProjectionSettingsStore.ts  # Projection settings store (71 lines)
│   │   ├── defaults.ts              #   Default values for all store domains
│   │   ├── types/
│   │   │   ├── index.ts              #   Re-exports all types
│   │   │   ├── finance.types.ts      #   ITransaction, IAccount, ICategory, etc.
│   │   │   ├── investment.types.ts   #   IETFTransaction, IPortfolioSnapshot, etc.
│   │   │   ├── budget.types.ts       #   BudgetTarget, BudgetProgressSnapshot, etc.
│   │   │   └── projection.types.ts   #   IProjectionInput, IMonthlySnapshot
│   │   ├── validation/
│   │   │   ├── index.ts              #   Re-exports
│   │   │   ├── finance.validation.ts #   Transaction/Recurring validation
│   │   │   └── investment.validation.ts  # ETF/Broker validation
│   │   ├── sanitization/
│   │   │   ├── index.ts              #   Re-exports
│   │   │   ├── transaction.ts        #   Transaction sanitizer
│   │   │   ├── recurring.ts          #   Recurring sanitizer
│   │   │   └── investment.ts         #   Investment sanitizer
│   │   ├── sync/
│   │   │   └── index.ts              #   Firestore sync helpers, default config
│   │   └── backup/
│   │       └── index.ts              #   Backup/export/import logic (293 lines)
│   │
│   ├── hooks/                        # 🪝 Custom React hooks (8 files)
│   │   ├── useSyncFinance.ts         #   Finance -> Firestore sync
│   │   ├── useInvestmentSync.ts      #   Investment -> Firestore sync
│   │   ├── useBudgetSync.ts          #   Budget -> Firestore sync
│   │   ├── useMarketData.ts          #   Market price fetching
│   │   ├── useHistoricalSnapshots.ts #   Portfolio snapshot recording
│   │   ├── usePacAutomation.ts       #   PAC transaction generation
│   │   ├── useProjections.ts         #   Financial projection calculations
│   │   └── useLogout.ts             #   Logout handler
│   │
│   ├── analytics/                    # 📊 Self-contained analytics module
│   │   ├── index.ts                  #   Re-exports all
│   │   ├── types.ts                  #   Analytics filter types
│   │   ├── hooks/
│   │   │   ├── index.ts              #   Re-exports
│   │   │   ├── usePortfolio.ts       #   Portfolio performance computation
│   │   │   ├── useNetWorth.ts        #   Net worth over time
│   │   │   ├── useMonthlyComparison.ts   # Month-over-month comparison
│   │   │   ├── useCategoryBreakdown.ts   # Spending by category
│   │   │   ├── useAccountBreakdown.ts    # Balance by account
│   │   │   └── useTaxTracking.ts     #   Tax tracking data
│   │   └── components/
│   │       ├── index.ts              #   Re-exports (default exports)
│   │       ├── AnalyticsFilters.tsx  #   Date range / granularity filter bar
│   │       ├── CategoryPieChart.tsx  #   Pie chart of spending by category
│   │       ├── CategoryBarChart.tsx  #   Bar chart of spending by category
│   │       ├── MonthlyComparisonChart.tsx  # Monthly income/expense bars
│   │       ├── NetWorthChart.tsx     #   Net worth line chart
│   │       └── AccountBreakdownChart.tsx  # Account balances chart
│   │
│   ├── lib/                          # 🔧 Library utilities
│   │   ├── firebase.ts               #   Firebase app initialization
│   │   ├── converters.ts             #   Firestore UserDoc converter (278 lines)
│   │   ├── budgetEngine.ts           #   Pure budget computation functions
│   │   ├── compoundInterestUtils.ts  #   CAGR, financial projection math
│   │   └── i18n.ts                  #   i18next configuration
│   │
│   ├── theme/
│   │   └── theme.ts                  #   MUI dark theme with chart colors
│   │
│   ├── types/                        # 📐 Shared type definitions
│   │   ├── auth.types.tsx            #   IAuthState interface
│   │   └── props.types.tsx           #   ITabPanelProps (shared component props)
│   │
│   ├── utils/
│   │   └── variables.utils.tsx       #   getEnvVar() — typed env access
│   │
│   ├── locales/
│   │   ├── it.json                   #   Italian translations
│   │   └── en.json                   #   English translations
│   │
│   └── assets/
│       └── react.svg                 #   Static asset
│
├── docs/
│   └── YATF/                         # LLM Wiki (architecture decision records)
│       ├── AGENTS.md                 #   Schema for wiki entries
│       ├── index.md
│       ├── log.md
│       ├── wiki/                     #   Processed wiki content
│       └── raw/                      #   Raw notes for ingestion
│
├── .planning/                        # 📋 GSD planning directory
│   ├── ROADMAP.md
│   ├── PROJECT.md
│   └── codebase/                     #   Codebase mapping documents
│
├── dist/                             # Vite production build output
│
├── .firebase/                        # Firebase hosting cache
│
├── .opencode/                        # OpenCode agent skills
│   └── skills/                       #   openspec-* skills
│
├── .claude/
│   └── skills/                       #   GSD skills
│
├── .versionrc                        # Standard version config
│
├── agent_hub.py                      # AI agent orchestration script
├── run_agent.sh                      # Agent runner script
└── .DS_Store
```

## Directory Purposes

**`src/pages/`:**
- Purpose: One React component per route/URL path. These are the top-level views.
- Contains: 13 page components + 3 nested tab pages (InsightsPage, SalaryPage, InvestmentPage, ProjectionsPage are embedded within FinancePage/InvestmentsPage tabs)
- Key files: `App.tsx` routes to these pages

**`src/components/`:**
- Purpose: Reusable UI components organized by domain (dashboard, budget, investment, etc.)
- Contains: 38 `.tsx` component files across 8 subdirectories
- Key pattern: Each domain has its own folder (e.g., `components/budget/`). Shared utility components go in `components/common/`.

**`src/store/`:**
- Purpose: All state management — Zustand stores, types, validation, sanitization, sync, and backup
- Contains: 5 store files, 5 type files, 2 validation files, 3 sanitization files, 1 sync file, 1 backup file, defaults
- Key pattern: `useXStore.ts` for each domain store. Store actions embed async Firestore calls.

**`src/hooks/`:**
- Purpose: Custom React hooks for data synchronization and business logic
- Contains: 8 hook files
- Key pattern: Three sync hooks mirror the three data stores (finance, investment, budget). Each handles Firestore init and real-time subscription.

**`src/analytics/`:**
- Purpose: Self-contained analytics subsystem (computed data + chart components)
- Contains: 6 hooks, 6 chart components, type definitions, barrel exports
- Key pattern: Hooks consume store data and return computed analytics. Re-exported via `src/analytics/index.ts`.

**`src/lib/`:**
- Purpose: Framework initialization and utility libraries
- Contains: Firebase config, Firestore converter, budget engine, compound interest utils, i18n
- Key pattern: Pure functions + side-effectful init code. No React dependency.

**`src/locales/`:**
- Purpose: Translation JSON files for i18n
- Contains: `it.json` (Italian) and `en.json` (English)

**`docs/YATF/`:**
- Purpose: LLM-managed wiki documentation — architecture decisions, conventions, raw notes
- Contains: Processed wiki pages and raw markdown notes for ingestion

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM render, provider wrapping (MUI theme, dayjs, i18n)
- `src/App.tsx`: Router setup, ProtectedRoute, global sync initialization, auth listener
- `index.html`: Vite HTML shell

**Configuration:**
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`: TypeScript project references
- `package.json`: Dependencies, scripts (dev, build, lint, preview)
- `src/theme/theme.ts`: MUI theme configuration
- `src/lib/firebase.ts`: Firebase project configuration

**Core Logic:**
- `src/store/useFinanceStore.ts`: Central finance state + all CRUD actions
- `src/store/useInvestmentStore.ts`: Investment state + portfolio computations
- `src/store/useBudgetStore.ts`: Budget targets state
- `src/hooks/useSyncFinance.ts`: Finance data sync with Firestore
- `src/store/sync/index.ts`: Sync initialization helpers
- `src/lib/converters.ts`: Firestore type-safe converter
- `src/lib/budgetEngine.ts`: Budget computation algorithms

## Naming Conventions

**Files:**
- **Components:** PascalCase with optional `.component.tsx` suffix for some dashboard components (`AccountCard.component.tsx`, `YearSelector.component.tsx`). No consistent pattern — most use `.tsx` directly.
- **Stores:** `useXStore.ts` (camelCase with `use` prefix)
- **Hooks:** `useX.ts` (camelCase with `use` prefix)
- **Types:** `*.types.ts` or `*.types.tsx` (kebab-case domain prefix)
- **Pages:** PascalCase with `Page` suffix (`DashboardPage.tsx`, `TransactionsPage.tsx`)

**Functions:**
- **Store actions:** camelCase (`addTransaction`, `setCategories`, `checkRecurring`)
- **Utility functions:** camelCase (`computeBudgetProgress`, `sanitizeTransaction`, `validateTransaction`)
- **Hooks:** `use` prefix camelCase (`useSyncFinance`, `usePortfolio`)

**Variables:**
- **State selectors:** camelCase (`budgetTargets`, `etfTransactions`)
- **Store:** camelCase

**Types:**
- **Interfaces:** `I` prefix + PascalCase (`ITransaction`, `IAccount`, `ICategory`, `IETFTransaction`)
- **Type aliases:** PascalCase (`Transaction`, `Account`, `Category` — backward-compatible aliases in `useFinanceStore.ts`)
- **React component props:** PascalCase + `Props` suffix (`SidebarProps`, `TabPanelProps`, `ITabPanelProps`)

## Where to Add New Code

**New Feature (e.g., "Net Worth Calculator"):**
- Primary code: `src/pages/NewFeaturePage.tsx` (page component) + route in `src/App.tsx`
- State management: `src/store/useNewFeatureStore.ts` (if needed) or extend existing store
- UI components: `src/components/newfeature/*.tsx`
- Hooks: `src/hooks/useNewFeature.ts` (data computation or sync)
- Types: `src/store/types/newfeature.types.ts`
- If analytics-heavy: add hook to `src/analytics/hooks/` + component to `src/analytics/components/`

**New Component/Module:**
- Implementation: `src/components/<domain>/ComponentName.tsx`
- For domain-specific components: create subdirectory in `src/components/<domain>/`
- For shared utilities: `src/components/common/`
- Export via barrel file: create `index.ts` if multiple files in directory

**Utilities:**
- Shared helpers: `src/lib/` (pure functions, no React dependencies)
- Validation logic: `src/store/validation/` (following existing pattern)
- Sanitization logic: `src/store/sanitization/` (following existing pattern)

**Tests (future):**
- Co-located: `src/**/*.test.ts` or `src/**/*.test.tsx`
- No test infrastructure currently configured

## Special Directories

**`src/analytics/`:**
- Purpose: Self-contained analytics module with its own hooks and components
- Generated: No
- Committed: Yes
- Note: This is a domain module, not a build artifact. Re-exports everything via barrel `index.ts`.

**`docs/YATF/`:**
- Purpose: LLM Wiki documentation (architecture decisions, meeting notes, conventions)
- Generated: Yes — wiki content is LLM-processed from raw notes
- Committed: Yes — full history of decisions

**`.planning/`:**
- Purpose: GSD (Goal-Structured Development) planning artifacts
- Generated: Yes — created by GSD workflow tools
- Committed: Yes — planning history tracked alongside code

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes — `npm run build`
- Committed: No — in `.gitignore`

---

*Structure analysis: 2026-07-11*
