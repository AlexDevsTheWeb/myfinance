---
title: "Technology Stack"
tags: [architecture, tech-stack, dependencies]
created: 2026-06-22
updated: 2026-06-22
status: active
sources: ["raw/codebase/STACK.md"]
related: ["architecture/codebase-structure", "architecture/external-integrations"]
---

# Technology Stack

*Analysis: 2026-06-22*

## Languages
- **TypeScript ~6.0.3** — primary, throughout codebase and config
- **JavaScript (ESM)** — Vite config, version generation script
- CSS — component styling (`src/index.css`, `src/App.css`)

## Frameworks

| Layer | Technology |
|-------|------------|
| UI Library | React ^19.2.6 |
| Routing | React Router DOM ^7.15.1 |
| UI Components | MUI ^9.0.1 + MUI Icons + Emotion 11 |
| Date Pickers | MUI X Date Pickers ^9.2.0 (Pro) |
| State Management | Zustand ^5.0.13 |
| Charts | Recharts ^3.8.1 |
| Build | Vite ^8.0.13 + @vitejs/plugin-react ^6.0.2 |
| Linting | ESLint ^10.4.0 + typescript-eslint ^8.59.3 |
| Drag & Drop | dnd-kit (core ^6.3.1, sortable ^10.0.0, utilities ^3.2.2) |
| Icons | Lucide React ^1.16.0 + MUI Icons |
| Dates | Dayjs ^1.11.20 |
| Backend | Firebase ^12.13.0 (Auth + Firestore + Hosting) |
| i18n | i18next ^26.2.0 + react-i18next ^17.0.8 + i18next-browser-languagedetector ^8.2.1 |
| Versioning | standard-version ^9.5.0 (deprecated) |

## Runtime
- **Node.js:** 22.12.0 (`.nvmrc`), CI uses Node.js 24
- **Package manager:** npm (lockfile present)

## Configuration
- Vite env vars via `import.meta.env` with `VITE_` prefix
- Firebase config via `VITE_FIREBASE_*` + `VITE_REACT_APP_TITLE`
- TypeScript project references: `tsconfig.json` → `tsconfig.app.json` (ES2022, strict, bundler) + `tsconfig.node.json` (ES2023)
- ESLint flat config (`eslint.config.js`) with React hooks + refresh plugins
- `.versionrc` — conventional commits bump rules
- `.nvmrc` — Node version requirement

## Versioning
- **Version:** 2026.2.1 (`package.json`)
- **Tool:** `standard-version` — conventional commit → version bump + changelog
- **Pre-build:** `scripts/generate-version.js` writes `src/version.ts` with version + build date + git SHA

## Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `vite` | Dev server (port 5173, HMR, auto-open) |
| prebuild | `node scripts/generate-version.js` | Generate version info |
| build | `tsc -b && vite build` | Type-check then bundle |
| lint | `eslint .` | Lint all files |
| preview | `vite preview` | Preview production build |

## Platform
- **Dev:** Node.js >=22.12.0, npm, modern browser, Firebase project with Firestore
- **Prod:** Firebase Hosting + Firestore (Native mode) + Firebase Auth (Google)

## Related

- [[wiki/architecture/codebase-structure]]
- [[wiki/architecture/external-integrations]]
- [[wiki/conventions/coding-conventions]]
