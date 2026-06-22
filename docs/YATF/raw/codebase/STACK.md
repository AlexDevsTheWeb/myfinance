# Technology Stack

**Analysis Date:** 2026-06-22

## Languages

**Primary:**
- TypeScript ~6.0.3 — All source code in `src/`, configuration files, and build tooling
- JavaScript (ESM) — Vite config (`vite.config.ts`), version generation script (`scripts/generate-version.js`)

**Secondary:**
- CSS — Component-level styles and `src/index.css`, `src/App.css`

## Runtime

**Environment:**
- Node.js 22.12.0 (set in `.nvmrc`)
- CI uses Node.js 24 (set in `.github/workflows/version-bump.yml`)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- React ^19.2.6 — UI framework, rendering via `react-dom ^19.2.6`
- React Router DOM ^7.15.1 — Client-side routing (`src/App.tsx`)
- Vite ^8.0.13 — Build tool and dev server

**State Management:**
- Zustand ^5.0.13 — Global state stores (`src/store/useAuthStore.ts`, `src/store/useFinanceStore.ts`)

**UI Component Library:**
- MUI (Material UI) ^9.0.1 — `@mui/material`, `@mui/icons-material`, `@emotion/react@11.14.0`, `@emotion/styled@11.14.1`
- MUI X Date Pickers ^9.2.0 — Date picker components (`@mui/x-date-pickers`, pro variant)
- Dayjs ^1.11.20 — Date utility library (dates, locales, MUI adapter via `AdapterDayjs`)

**Charts:**
- Recharts ^3.8.1 — Chart components for analytics (`src/analytics/components/`)

**Drag & Drop:**
- dnd-kit ^6.3.1 / ^10.0.0 — `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**Icons:**
- Lucide React ^1.16.0 — Icon library (alongside MUI icons)

**Testing:**
- Not detected — No test runner, no test files found

**Build/Dev:**
- Vite ^8.0.13 — Dev server (port 5173), HMR, production builds
- @vitejs/plugin-react ^6.0.2 — Vite React plugin with SWC or esbuild-based transform
- TypeScript ~6.0.3 — Type checking via `tsc -b`
- ESLint ^10.4.0 — Linting via `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- Globals ^17.6.0 — ESLint global definitions

## Key Dependencies

**Critical:**
| Package | Version | Why It Matters |
|---------|---------|----------------|
| firebase | ^12.13.0 | Auth (Google sign-in), Firestore (all data persistence), Hosting |
| react | ^19.2.6 | Entire UI depends on it |
| react-router-dom | ^7.15.1 | All page routing, protected routes |
| zustand | ^5.0.13 | Every feature store (auth, finance data) |
| @mui/material | ^9.0.1 | Theming, layout, form controls, dialogs |
| recharts | ^3.8.1 | All charts (net worth, category breakdown, monthly comparison) |

**Infrastructure:**
| Package | Version | Purpose |
|---------|---------|---------|
| @dnd-kit/core | ^6.3.1 | Sortable transaction lists |
| dayjs | ^1.11.20 | Date formatting, i18n locale switching |
| i18next | ^26.2.0 | Internationalization framework |
| i18next-browser-languagedetector | ^8.2.1 | Auto-detect browser language |
| react-i18next | ^17.0.8 | React bindings for i18next |

## Configuration

**Environment:**
- Vite mode: env vars prefixed with `VITE_` (e.g., `VITE_FIREBASE_*`)
- `.env` — App title only
- `.env.development` — Firebase dev credentials
- `.env.production` — Firebase production credentials and title
- Env validation via `src/utils/variables.utils.tsx` — throws if a required var is missing

**Required env vars:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_REACT_APP_TITLE`

**Build:**
- `tsconfig.json` — Project references root (references `tsconfig.app.json`)
- `tsconfig.app.json` — Targets ES2022, bundler module resolution, strict mode, `jsx: react-jsx`
- `tsconfig.node.json` — Targets ES2023, for `vite.config.ts`
- `vite.config.ts` — React plugin, dev server on port 5173, auto-open
- `eslint.config.js` — TypeScript ESLint flat config, browser globals, React hooks + refresh plugins
- `.versionrc` — Conventional commits bump rules (major/minor/patch per commit type)

## Versioning

**Version:** 2026.2.1 (`package.json`)
**Tool:** `standard-version ^9.5.0` — Automates version bump and changelog from conventional commits
**Script:** `scripts/generate-version.js` — Pre-build script generates `src/version.ts` with version string, build date, and git commit SHA

## Platform Requirements

**Development:**
- Node.js >=22.12.0
- npm
- Modern browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Firestore enabled

**Production:**
- Firebase Hosting (deployed via Firebase CLI or GitHub Actions)
- Firestore database (Native mode, rules in `firestore.rules`)
- Firebase Authentication (Google provider)

## Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `vite` | Start dev server with HMR |
| prebuild | `node scripts/generate-version.js` | Generate version info before build |
| build | `tsc -b && vite build` | Type-check then bundle |
| lint | `eslint .` | Lint all files |
| preview | `vite preview` | Preview production build locally |

---

*Stack analysis: 2026-06-22*
