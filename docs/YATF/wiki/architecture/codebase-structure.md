---
type: Architecture
description: "Directory layout, file naming conventions, and source organization."
title: "Codebase Structure"
tags: [architecture, structure, codebase]
created: 2026-06-22
updated: 2026-10-04
status: active
sources: ["raw/codebase/STRUCTURE.md"]
related: ["architecture/tech-stack", "architecture/system-architecture", "conventions/coding-conventions", "architecture/monorepo-layout", "plans/monorepo-migration"]
---

# Codebase Structure

*Analysis: 2026-07-11 · layout updated 2026-10-04 for the [[wiki/plans/monorepo-migration]]*

## Directory Layout

```
myfinance/
├── package.json                      # Root: version + workspace orchestration
├── tsconfig.json                     # Root TS solution -> apps/web
├── eslint.config.js                  # Root ESLint flat config (covers apps/)
├── firebase.json                     # Hosting public = apps/web/dist
├── AGENTS.md                         # Dev notes, commands, workflow rules
├── firestore.rules                   # Firestore security rules
├── .nvmrc                           # Node 22.19.0
├── .npmrc                           # legacy-peer-deps=true
├── .versionrc                        # standard-version config
│
├── scripts/                          # Stays at root (paths are root-relative)
│   ├── generate-version.js           # Pre-build version injection -> apps/web/src/version.ts
│   ├── fix-tsc-bin.js                # Postinstall: fixes tsc binary path
│   └── ts-eslint-resolve.cjs         # Linting workaround for TS 7 + ESLint
│
├── apps/
│   └── web/                          # The frontend (npm workspace)
│       ├── package.json              #   Workspace manifest (version pinned 0.0.0)
│       ├── index.html                #   Vite HTML entry point
│       ├── vite.config.ts            #   Vite configuration
│       ├── vitest.config.ts          #   Vitest configuration
│       ├── tsconfig.json             #   App solution -> tsconfig.app.json
│       ├── tsconfig.app.json         #   App TS config (strict, ES2022)
│       ├── tsconfig.node.json        #   Node/Vite TS config
│       ├── public/                   #   Static assets served by Vite
│       └── src/
│           ├── main.tsx                      # Entry: React root + providers
│           ├── App.tsx                       # Router, ProtectedRoute, global sync
│           ├── version.ts                    # Auto-generated version info
│           │
│           ├── pages/                        # 14 page components
│           │   ├── LoginPage.tsx             #   / — Google OAuth + email/password
│           │   ├── DashboardPage.tsx         #   /dashboard
│           │   ├── TransactionsPage.tsx      #   /transactions
│           │   ├── FinancePage.tsx           #   /finance — Tabs: Salary + Insights
│           │   ├── InvestmentsPage.tsx       #   /investments — Tabs: Investment + Projections
│           │   ├── BudgetPage.tsx            #   /budget
│           │   ├── ConfigPage.tsx            #   /config (~1054 lines)
│           │   ├── CarPage.tsx               #   /car (~695 lines)
│           │   ├── UtilitiesPage.tsx         #   /utilities
│           │   ├── AnalysisPage.tsx          #   /analysis — Dead redirect to /insights
│           │   ├── InsightsPage.tsx          #   Nested under /finance
│           │   ├── SalaryPage.tsx            #   Nested under /finance
│           │   ├── InvestmentPage.tsx        #   Nested under /investments
│           │   └── ProjectionsPage.tsx       #   Lazy under /investments
│           │
│           ├── components/                   # 38+ reusable UI components
│           │   ├── layout/                   #   Layout.tsx, Sidebar.tsx
│           │   ├── dashboard/                #   AccountCard, Charts, RecapCards, etc.
│           │   ├── budget/                   #   BulletChart, BudgetSummaryCards, etc.
│           │   ├── investment/               #   14 components (BrokerSettings, Holdings, etc.)
│           │   ├── projections/              #   ProjectionChart, Controls, Summary
│           │   ├── analysis/                 #   AnalysisTables, FinancialTrendChart
│           │   ├── forms/TransactionForm.tsx #   Reusable form with validation
│           │   ├── modals/TransactionModal.tsx
│           │   ├── common/                   #   YearSelector, VersionFooter
│           │   └── TransactionError.tsx      #   Global error snackbar
│           │
│           ├── store/                        # Zustand state management
│           │   ├── useFinanceStore.ts        #   Core finance store (~1250 lines)
│           │   ├── useInvestmentStore.ts     #   Investment store (~585 lines)
│           │   ├── useBudgetStore.ts         #   Budget store (~100 lines)
│           │   ├── useAuthStore.ts           #   Auth store (11 lines)
│           │   ├── useProjectionSettingsStore.ts
│           │   ├── defaults.ts
│           │   ├── types/                    #   finance.types, investment.types, budget.types, projection.types
│           │   ├── validation/               #   finance.validation.ts, investment.validation.ts
│           │   ├── sanitization/             #   transaction.ts, recurring.ts, investment.ts
│           │   ├── sync/index.ts             #   Firestore init helpers
│           │   └── backup/index.ts           #   Export/import logic (293 lines)
│           │
│           ├── hooks/                        # 8 custom hooks
│           │   ├── useSyncFinance.ts         #   Finance → Firestore sync
│           │   ├── useInvestmentSync.ts      #   Investment → Firestore sync
│           │   ├── useBudgetSync.ts          #   Budget → Firestore sync
│           │   ├── useMarketData.ts          #   Market price fetching (yfin.dev)
│           │   ├── useHistoricalSnapshots.ts #   Portfolio snapshot recording
│           │   ├── usePacAutomation.ts       #   PAC transaction generation
│           │   ├── useProjections.ts         #   Financial projection calculations
│           │   └── useLogout.ts             #   Logout handler
│           │
│           ├── analytics/                    # Self-contained analytics module
│           │   ├── types.ts                  #   Filter types
│           │   ├── hooks/                    #   6 hooks (usePortfolio, useNetWorth, etc.)
│           │   └── components/               #   6 chart components
│           │
│           ├── lib/                          # Utilities
│           │   ├── firebase.ts               #   Firebase app init
│           │   ├── converters.ts             #   Firestore UserDoc converter (278 lines)
│           │   ├── budgetEngine.ts           #   Pure budget computation functions
│           │   ├── compoundInterestUtils.ts  #   CAGR, projection math
│           │   └── i18n.ts                  #   i18next configuration
│           │
│           ├── theme/theme.ts               # MUI dark theme
│           ├── types/                        # auth.types.tsx, props.types.tsx
│           ├── utils/variables.utils.tsx     # getEnvVar
│           ├── locales/                      # it.json, en.json
│           └── assets/react.svg
│
├── docs/YATF/                        # LLM Wiki
├── .planning/                        # GSD planning artifacts
├── .opencode/                        # OpenCode agent skills
└── agent_hub.py                      # AI agent orchestration
```

## Where to Add New Code

| What | Where | Notes |
|------|-------|-------|
| New page | `apps/web/src/pages/{Name}Page.tsx` | Register route in `App.tsx`, nav link in Sidebar, locales |
| New component | `apps/web/src/components/{domain}/{Name}.tsx` | |
| New store | `apps/web/src/store/use{Name}Store.ts` | Prefer domain-specific |
| New analytics hook | `apps/web/src/analytics/hooks/use{Computation}.ts` | Register in barrel files |
| New chart | `apps/web/src/analytics/components/{Name}Chart.tsx` | Use MUI X Charts |
| New hook | `apps/web/src/hooks/use{Name}.ts` | Only for cross-domain hooks |
| New utility | `apps/web/src/lib/` | Pure functions, no React dependency |
| Validation/sanitization | `apps/web/src/store/validation/` or `apps/web/src/store/sanitization/` | Follow existing pattern |

## Related

- [[wiki/architecture/system-architecture]]
- [[wiki/conventions/coding-conventions]]
- [[wiki/architecture/tech-stack]]
- [[wiki/architecture/monorepo-layout]] — target structure and couplings
- [[wiki/plans/monorepo-migration]] — the migration that produced this layout
