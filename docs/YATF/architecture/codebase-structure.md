---
title: "Codebase Structure"
tags: [architecture, structure, codebase]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/STRUCTURE.md"]
related: ["architecture/tech-stack", "architecture/system-architecture", "conventions/coding-conventions"]
---

# Codebase Structure

*Analysis: 2026-06-22*

## Directory Layout

```
myfinance/
├── src/
│   ├── main.tsx                   # Entry: React root + providers (Theme, Localization, i18n)
│   ├── App.tsx                    # Router, auth listener, protected routes
│   ├── App.css / index.css        # Global styles
│   │
│   ├── pages/                     # 8 route-level components
│   │   ├── LoginPage.tsx          # Auth entry (Google OAuth + email/password)
│   │   ├── DashboardPage.tsx      # Home: recap, charts, tx table
│   │   ├── TransactionsPage.tsx   # Full transaction list
│   │   ├── AnalysisPage.tsx       # Annual/monthly analysis tables
│   │   ├── InsightsPage.tsx       # Deep analytics with charts
│   │   ├── SalaryPage.tsx         # Salary tracking
│   │   ├── CarPage.tsx            # Car mileage & tire (679 lines)
│   │   ├── UtilitiesPage.tsx      # Utility bill tracking
│   │   └── ConfigPage.tsx         # Settings, categories, backup (897 lines)
│   │
│   ├── components/                # Reusable UI components
│   │   ├── layout/Layout.tsx      # App shell: AppBar, nav drawer, FAB (425 lines)
│   │   ├── dashboard/             # RecapCards, Charts, TransactionTable, AccountCard
│   │   ├── modals/TransactionModal.tsx
│   │   ├── forms/TransactionForm.tsx  # Reusable form with validation (388 lines)
│   │   ├── analysis/              # AnalysisTables, FinancialTrendChart
│   │   ├── common/                # YearSelector, VersionFooter
│   │   └── TransactionError.tsx   # Global save error banner
│   │
│   ├── analytics/                 # Derived analytics (barreled)
│   │   ├── types.ts               # IAnalyticsFilters, ICategoryBreakdown, etc.
│   │   ├── hooks/                 # useNetWorth, useCategoryBreakdown, useAccountBreakdown, useMonthlyComparison
│   │   └── components/            # NetWorthChart, CategoryPieChart, CategoryBarChart, etc.
│   │
│   ├── store/                     # State management (Zustand)
│   │   ├── useFinanceStore.ts     # Central store: ~1200 lines, ~70 actions
│   │   ├── useAuthStore.ts        # Auth state (11 lines)
│   │   ├── defaults.ts            # Default accounts, categories, settings, modules
│   │   ├── types/finance.types.ts # All I-prefixed interfaces
│   │   ├── validation/            # finance.validation.ts
│   │   ├── sanitization/          # transaction.ts, recurring.ts
│   │   ├── backup/index.ts        # createBackup, validateBackupData (216 lines)
│   │   └── sync/index.ts          # Firestore init helpers
│   │
│   ├── lib/                       # Third-party init
│   │   ├── firebase.ts            # Firebase app + Auth + Firestore
│   │   ├── i18n.ts                # i18next config + dayjs locale sync
│   │   └── converters.ts          # FirestoreDataConverter<UserDoc>
│   │
│   ├── hooks/                     # Shared hooks
│   │   ├── useSyncFinance.ts      # Firestore init + realtime snapshot
│   │   └── useLogout.ts           # Sign out + cleanup + redirect
│   │
│   ├── types/                     # Shared TS interfaces
│   │   ├── auth.types.tsx
│   │   └── props.types.tsx
│   │
│   ├── theme/theme.ts             # MUI dark theme (Inter font, indigo primary)
│   ├── locales/                   # it.json (Italian, fallback), en.json
│   ├── utils/variables.utils.tsx  # getEnvVar — typed env var access
│   └── assets/react.svg
│
├── scripts/generate-version.js    # Pre-build version injection
├── .github/workflows/             # CI/CD (version-bump, PR preview)
├── .planning/                     # GSD artifacts
├── .nvmrc                         # Node 22.12.0
├── .versionrc                     # standard-version config
├── firestore.rules                # Security rules
├── firebase.json                  # Hosting config
├── AGENTS.md                      # Dev agent instructions
└── README.md
```

## Where to Add New Code

| What | Where | Notes |
|------|-------|-------|
| New page | `src/pages/{Name}Page.tsx` | Register route in `App.tsx`, nav link in Layout.tsx drawer, locales |
| New component | `src/components/{domain}/{Name}.tsx` | Use `.component.tsx` suffix if reusable across domains |
| New store | `src/store/use{Name}Store.ts` | Prefer domain-specific to avoid god-store growth |
| New analytics hook | `src/analytics/hooks/use{Computation}.ts` | Register in barrel files (`hooks/index.ts`, `analytics/index.ts`) |
| New chart component | `src/analytics/components/{Name}Chart.tsx` | Thin recharts wrapper |
| New hook | `src/hooks/use{Name}.ts` | Only for hooks shared across domains |
| New utility | `src/utils/{name}.utils.tsx` | Avoid `src/lib/` — reserved for third-party init |
| New type | `src/store/types/finance.types.ts` or `src/types/{name}.types.tsx` | |

## Related

- [[architecture/system-architecture]]
- [[conventions/coding-conventions]]
- [[architecture/tech-stack]]
