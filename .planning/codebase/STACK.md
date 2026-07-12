# Technology Stack

**Analysis Date:** 2026-07-11

## Languages

**Primary:**
- TypeScript ^7.0.1-rc — All source code in `src/`, configuration files, and build tooling. Uses TS 7.0 Go rewrite for ~10x faster type-checking.
- JavaScript (ESM) — Vite config (`vite.config.ts`), build scripts (`scripts/generate-version.js`, `scripts/fix-tsc-bin.js`), and ESLint config (`eslint.config.js`, `scripts/ts-eslint-resolve.cjs`)

**Secondary:**
- CSS — Global styles in `src/index.css`; component-level styles via MUI `sx` prop and Emotion styled components

## Runtime

**Environment:**
- Node.js 22.19.0 (set in `.nvmrc`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)
- `postinstall` script: `node scripts/fix-tsc-bin.js` — ensures `node_modules/.bin/tsc` points to TS 7 binary, not TS 6 fallback

## Frameworks

**Core:**
- React ^19.2.6 — UI framework, rendering via `react-dom ^19.2.6`
- React Router DOM ^7.15.1 — Client-side routing in `src/App.tsx` with `BrowserRouter`, `Routes`, `Route`, `Navigate`
- Vite ^8.0.13 — Build tool and dev server

**State Management:**
- Zustand ^5.0.13 — 4 global stores (`src/store/useAuthStore.ts`, `src/store/useFinanceStore.ts`, `src/store/useInvestmentStore.ts`, `src/store/useBudgetStore.ts`)

**UI Component Library:**
- MUI (Material UI) ^9.0.1 — Core theming, layout, form controls, dialogs, cards, typography
  - `@mui/icons-material ^9.0.1` — Icon set
  - `@emotion/react ^11.14.0` / `@emotion/styled ^11.14.1` — Styling engine (peer deps of MUI v9)
- MUI X Charts ^9.2.0 — All chart components (`@mui/x-charts` / `@mui/x-charts-pro`)
  - Used in 16+ components across dashboard, analytics, investments, projections, budget, car, utilities, salary pages
  - Components used: `BarChart`, `LineChart`, `PieChart`, `ChartsDataProvider`, `ChartsSurface`, `ChartsWrapper`, `ChartsTooltip`, `AreaPlot`, `LinePlot`, `ChartsAxis`, `ChartsGrid`, `ChartsLegend`
- MUI X Date Pickers ^9.2.0 — Date pickers (`@mui/x-date-pickers`, `@mui/x-date-pickers-pro`)
  - `LocalizationProvider` with `AdapterDayjs` in `src/main.tsx`
- Dayjs ^1.11.20 — Date utility library, locale switching, MUI adapter

**Icons:**
- MUI Icons (`@mui/icons-material ^9.0.1`) — Primary icon set
- Lucide React ^1.16.0 — Secondary icon set (`lucide-react`)

**Internationalization:**
- i18next ^26.2.0 — i18n framework
- react-i18next ^17.0.8 — React bindings
- i18next-browser-languagedetector ^8.2.1 — Browser language auto-detection
- Locale files: `src/locales/it.json`, `src/locales/en.json`

**Backend/Database:**
- Firebase ^12.13.0 — Auth + Firestore (see INTEGRATIONS.md for details)

**Drag & Drop:**
- @dnd-kit/core ^6.3.1 — Core DnD primitives
- @dnd-kit/sortable ^10.0.0 — Sortable lists (major version 10)
- @dnd-kit/utilities ^3.2.2 — Utility helpers

**Charts:**
- MUI X Charts (`@mui/x-charts ^9.2.0`) — All charting; no Recharts or other chart library present
  - Used in: `src/components/dashboard/Charts.tsx`, `src/analytics/components/` (6 files), `src/components/budget/` (2 files), `src/components/investment/` (2 files), `src/components/projections/ProjectionChart.tsx`, `src/pages/` (CarPage, SalaryPage, UtilitiesPage)

**Testing:**
- None — No test runner, no test files found in the codebase

**Build/Dev:**
- Vite ^8.0.13 — Dev server (port 5173, auto-open), HMR, production builds
- @vitejs/plugin-react ^6.0.2 — Vite React plugin (esbuild-based transform)
- TypeScript ^7.0.1-rc — Type checking via `tsc -b` (Go rewrite, ~10x faster)
- @typescript/typescript6 ^6.0.2 — TS 6 programmatic API for `@typescript-eslint/typescript-estree` compatibility (stub package, see `scripts/ts-eslint-resolve.cjs`)
- ESLint ^10.4.0 — Linting with flat config (`eslint.config.js`)
  - Plugins: `@eslint/js ^10.0.1`, `typescript-eslint ^8.59.3`
  - `eslint-plugin-react-hooks ^7.1.1`, `eslint-plugin-react-refresh ^0.5.2`
  - `globals ^17.6.0` — Browser global definitions

## Key Dependencies

**Critical:**
| Package | Version | Why It Matters |
|---------|---------|----------------|
| firebase | ^12.13.0 | Auth (Google Sign-In), Firestore (all data persistence) |
| react | ^19.2.6 | Entire UI depends on it |
| react-router-dom | ^7.15.1 | All page routing, protected routes |
| zustand | ^5.0.13 | All feature stores (auth, finance, investment, budget) |
| @mui/material | ^9.0.1 | Theming, layout, form controls, dialogs, cards |
| @mui/x-charts | ^9.2.0 | All charts across 6+ feature areas |

**Infrastructure:**
| Package | Version | Purpose |
|---------|---------|---------|
| @mui/x-date-pickers | ^9.2.0 | Date selection UI |
| dayjs | ^1.11.20 | Date formatting, i18n locale syncing |
| @dnd-kit/sortable | ^10.0.0 | Sortable transaction category lists |
| i18next | ^26.2.0 | Internationalization framework |
| lucide-react | ^1.16.0 | Icon set complementing MUI icons |

## Configuration

**Environment:**
- Vite mode: env vars prefixed with `VITE_` (accessed via `import.meta.env`)
- `.env` — Exists for environment configuration (contains app-level vars)
- `.env.development` — Development Firebase credentials
- `.env.production` — Production Firebase credentials and title
- Env validation: `src/utils/variables.utils.tsx` — `getEnvVar()` throws `Error` if missing at module load time

**Required env vars (validated in `src/lib/firebase.ts`):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

**TypeScript Config:**
- `tsconfig.json` — Project references root, references `tsconfig.app.json` only
- `tsconfig.app.json` — Targets ES2022, bundler module resolution, `strict: true`, `jsx: react-jsx`, `noUncheckedSideEffectImports: true`, `verbatimModuleSyntax: true`
- `tsconfig.node.json` — Targets ES2023, for `vite.config.ts` only, with `erasableSyntaxOnly: true`

**Build:**
- `vite.config.ts` — React plugin, dev server on port 5173 with `open: true`
- `eslint.config.js` — Flat config with TS recommended, React hooks + refresh plugins

**Linting Workaround:**
- `scripts/ts-eslint-resolve.cjs` — NODE_OPTIONS hook to resolve `@typescript-eslint/typescript-estree` to TS 6 API
- `scripts/fix-tsc-bin.js` — postinstall script fixing `node_modules/.bin/tsc` to TS 7 binary

## Versioning

**Version:** 2026.2.1 (`package.json`)

**Tool:** `standard-version ^9.5.0` — Automates version bump and changelog from conventional commits
- Tag prefix: `v`
- Commit format: `chore(release): {{currentTag}}`
- Empty release header

**Script:** `scripts/generate-version.js` — Pre-build (`prebuild`) generates `src/version.ts` with version string, build date, and git commit SHA

## Platform Requirements

**Development:**
- Node.js >=22.19.0 (per `.nvmrc`)
- npm
- Modern browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Firestore (Native mode) and Auth (Google provider) enabled

**Production:**
- Firebase Hosting (configured in `firebase.json` — SPA rewrites to `index.html`)
- Firestore database (Native mode, rules in `firestore.rules`)
- Firebase Authentication (Google provider)

## Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `vite` | Start dev server with HMR (port 5173, auto-open) |
| prebuild | `node scripts/generate-version.js` | Generate `src/version.ts` before build |
| build | `tsc -b && vite build` | Type-check (TS 7 Go binary) then Vite bundle |
| lint | `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs' eslint .` | Lint with TS 6 compat shim |
| preview | `vite preview` | Preview production build locally |
| postinstall | `node scripts/fix-tsc-bin.js` | Fix tsc binary path after npm install |

## Project Structure Overview

```
myfinance/
├── src/
│   ├── analytics/        # Analytics logic, hooks, chart components
│   ├── components/       # Reusable UI components (layout, dashboard, investment, etc.)
│   ├── hooks/            # React hooks (Firestore sync, market data, PAC automation)
│   ├── lib/              # Firebase config, i18n, utility libs
│   ├── locales/          # i18n JSON files (it, en)
│   ├── pages/            # Route pages (14 pages)
│   ├── store/            # Zustand stores + types + validation + sanitization
│   ├── theme/            # MUI theme configuration
│   ├── types/            # Shared TypeScript interfaces
│   └── utils/            # Utility functions
├── scripts/              # Build/CI helper scripts
└── [config files]        # tsconfig, vite, eslint, firebase, etc.
```

---

*Stack analysis: 2026-07-11*
