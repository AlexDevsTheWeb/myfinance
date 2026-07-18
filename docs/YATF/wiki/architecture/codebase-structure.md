---
type: Architecture
description: "Directory layout, file naming conventions, and source organization."
title: "Codebase Structure"
tags: [architecture, structure, codebase]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/STRUCTURE.md"]
related: ["architecture/tech-stack", "architecture/system-architecture", "conventions/coding-conventions"]
---

# Codebase Structure

*Analysis: 2026-07-11*

## Directory Layout

```
myfinance/
├── index.html                        # Vite HTML entry point
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # Root TS config (project references)
├── tsconfig.app.json                 # App TS config (strict, ES2022)
├── tsconfig.node.json                # Node/Vite TS config
├── package.json
├── AGENTS.md                         # Dev notes, commands, workflow rules
├── firestore.rules                   # Firestore security rules
├── .nvmrc                           # Node 22.19.0
├── .versionrc                        # standard-version config
│
├── scripts/
│   ├── generate-version.js           # Pre-build version injection
│   ├── fix-tsc-bin.js                # Postinstall: fixes tsc binary path
│   └── ts-eslint-resolve.cjs         # Linting workaround for TS 7 + ESLint
│
├── src/
│   ├── main.tsx                      # Entry: React root + providers
│   ├── App.tsx                       # Router, ProtectedRoute, global sync
│   ├── version.ts                    # Auto-generated version info
│   │
│   ├── pages/                        # 14 page components
│   │   ├── LoginPage.tsx             #   / — Google OAuth + email/password
│   │   ├── DashboardPage.tsx         #   /dashboard
│   │   ├── TransactionsPage.tsx      #   /transactions
│   │   ├── FinancePage.tsx           #   /finance — Tabs: Salary + Insights
│   │   ├── InvestmentsPage.tsx       #   /investments — Tabs: Investment + Projections
│   │   ├── BudgetPage.tsx            #   /budget
│   │   ├── ConfigPage.tsx            #   /config (~1054 lines)
│   │   ├── CarPage.tsx               #   /car (~695 lines)
│   │   ├── UtilitiesPage.tsx         #   /utilities
│   │   ├── AnalysisPage.tsx          #   /analysis — Dead redirect to /insights
│   │   ├── InsightsPage.tsx          #   Nested under /finance
│   │   ├── SalaryPage.tsx            #   Nested under /finance
│   │   ├── InvestmentPage.tsx        #   Nested under /investments
│   │   └── ProjectionsPage.tsx       #   Lazy under /investments
│   │
│   ├── components/                   # 38+ reusable UI components
│   │   ├── layout/                   #   Layout.tsx, Sidebar.tsx
│   │   ├── dashboard/                #   AccountCard, Charts, RecapCards, etc.
│   │   ├── budget/                   #   BulletChart, BudgetSummaryCards, etc.
│   │   ├── investment/               #   14 components (BrokerSettings, Holdings, etc.)
│   │   ├── projections/              #   ProjectionChart, Controls, Summary
│   │   ├── analysis/                 #   AnalysisTables, FinancialTrendChart
│   │   ├── forms/TransactionForm.tsx #   Reusable form with validation
│   │   ├── modals/TransactionModal.tsx
│   │   ├── common/                   #   YearSelector, VersionFooter
│   │   └── TransactionError.tsx      #   Global error snackbar
│   │
│   ├── store/                        # Zustand state management
│   │   ├── useFinanceStore.ts        #   Core finance store (~1250 lines)
│   │   ├── useInvestmentStore.ts     #   Investment store (~585 lines)
│   │   ├── useBudgetStore.ts         #   Budget store (~100 lines)
│   │   ├── useAuthStore.ts           #   Auth store (11 lines)
│   │   ├── useProjectionSettingsStore.ts
│   │   ├── defaults.ts
│   │   ├── types/                    #   finance.types, investment.types, budget.types, projection.types
│   │   ├── validation/               #   finance.validation.ts, investment.validation.ts
│   │   ├── sanitization/             #   transaction.ts, recurring.ts, investment.ts
│   │   ├── sync/index.ts             #   Firestore init helpers
│   │   └── backup/index.ts           #   Export/import logic (293 lines)
│   │
│   ├── hooks/                        # 8 custom hooks
│   │   ├── useSyncFinance.ts         #   Finance → Firestore sync
│   │   ├── useInvestmentSync.ts      #   Investment → Firestore sync
│   │   ├── useBudgetSync.ts          #   Budget → Firestore sync
│   │   ├── useMarketData.ts          #   Market price fetching (yfin.dev)
│   │   ├── useHistoricalSnapshots.ts #   Portfolio snapshot recording
│   │   ├── usePacAutomation.ts       #   PAC transaction generation
│   │   ├── useProjections.ts         #   Financial projection calculations
│   │   └── useLogout.ts             #   Logout handler
│   │
│   ├── analytics/                    # Self-contained analytics module
│   │   ├── types.ts                  #   Filter types
│   │   ├── hooks/                    #   6 hooks (usePortfolio, useNetWorth, etc.)
│   │   └── components/               #   6 chart components
│   │
│   ├── lib/                          # Utilities
│   │   ├── firebase.ts               #   Firebase app init
│   │   ├── converters.ts             #   Firestore UserDoc converter (278 lines)
│   │   ├── budgetEngine.ts           #   Pure budget computation functions
│   │   ├── compoundInterestUtils.ts  #   CAGR, projection math
│   │   └── i18n.ts                  #   i18next configuration
│   │
│   ├── theme/theme.ts               # MUI dark theme
│   ├── types/                        # auth.types.tsx, props.types.tsx
│   ├── utils/variables.utils.tsx     # getEnvVar
│   ├── locales/                      # it.json, en.json
│   └── assets/react.svg
│
├── docs/YATF/                        # LLM Wiki
├── .planning/                        # GSD planning artifacts
├── .opencode/                        # OpenCode agent skills
└── agent_hub.py                      # AI agent orchestration
```

## Where to Add New Code

| What | Where | Notes |
|------|-------|-------|
| New page | `src/pages/{Name}Page.tsx` | Register route in `App.tsx`, nav link in Sidebar, locales |
| New component | `src/components/{domain}/{Name}.tsx` | |
| New store | `src/store/use{Name}Store.ts` | Prefer domain-specific |
| New analytics hook | `src/analytics/hooks/use{Computation}.ts` | Register in barrel files |
| New chart | `src/analytics/components/{Name}Chart.tsx` | Use MUI X Charts |
| New hook | `src/hooks/use{Name}.ts` | Only for cross-domain hooks |
| New utility | `src/lib/` | Pure functions, no React dependency |
| Validation/sanitization | `src/store/validation/` or `src/store/sanitization/` | Follow existing pattern |

## Related

- [[wiki/architecture/system-architecture]]
- [[wiki/conventions/coding-conventions]]
- [[wiki/architecture/tech-stack]]
