---
type: Architecture
description: "Full technology stack with library versions and dependency overview."
title: "Technology Stack"
tags: [architecture, tech-stack, dependencies]
created: 2026-06-22
updated: 2026-07-11
status: active
sources: ["raw/codebase/STACK.md"]
related: ["architecture/codebase-structure", "architecture/external-integrations"]
---

# Technology Stack

*Analysis: 2026-07-11*

## Languages
- **TypeScript ^7.0.1-rc** — primary, throughout codebase and config. Uses TS 7.0 Go rewrite for ~10x faster type-checking.
- **JavaScript (ESM)** — Vite config, build scripts, and ESLint config
- CSS — component styling (`src/index.css`, `src/App.css`)

## Frameworks

| Layer | Technology |
|-------|------------|
| UI Library | React ^19.2.6 |
| Routing | React Router DOM ^7.15.1 |
| UI Components | MUI ^9.0.1 + MUI Icons + Emotion 11 |
| Date Pickers | MUI X Date Pickers ^9.2.0 (Pro) |
| State Management | Zustand ^5.0.13 (5 stores) |
| Charts | MUI X Charts ^9.2.0 (no Recharts) |
| Build | Vite ^8.0.13 + @vitejs/plugin-react ^6.0.2 |
| Linting | ESLint ^10.4.0 + typescript-eslint ^8.59.3 |
| Drag & Drop | dnd-kit (core ^6.3.1, sortable ^10.0.0, utilities ^3.2.2) |
| Icons | Lucide React ^1.16.0 + MUI Icons |
| Dates | Dayjs ^1.11.20 |
| Backend | Firebase ^12.13.0 (Auth + Firestore + Hosting) |
| i18n | i18next ^26.2.0 + react-i18next ^17.0.8 + i18next-browser-languagedetector ^8.2.1 |
| Versioning | standard-version ^9.5.0 |

## Runtime
- **Node.js:** 22.19.0 (`.nvmrc`)
- **Package manager:** npm (lockfile present, postinstall script fixes tsc binary)

## TypeScript Workarounds
- `@typescript/typescript6 ^6.0.2` — TS 6 programmatic API stub for `@typescript-eslint/typescript-estree` compatibility
- `scripts/fix-tsc-bin.js` — postinstall script ensuring `node_modules/.bin/tsc` points to TS 7 binary
- `scripts/ts-eslint-resolve.cjs` — NODE_OPTIONS hook to resolve `typescript` to TS 6 API for ESLint

## Configuration
- Vite env vars via `import.meta.env` with `VITE_` prefix
- Firebase config via `VITE_FIREBASE_*` + `VITE_REACT_APP_TITLE`
- TypeScript project references: `tsconfig.json` → `tsconfig.app.json` (ES2022, strict, bundler, verbatimModuleSyntax) + `tsconfig.node.json` (ES2023, erasableSyntaxOnly)
- ESLint flat config (`eslint.config.js`) with React hooks + refresh plugins
- `.versionrc` — conventional commits bump rules
- `.nvmrc` — Node 22.19.0 requirement
- `.env.development` / `.env.production` — env var files (gitignored)

## Versioning
- **Version:** 2026.2.1 (`package.json`)
- **Tool:** `standard-version ^9.5.0` — conventional commit → version bump + changelog, tag prefix `v`
- **Pre-build:** `scripts/generate-version.js` writes `src/version.ts` with version + build date + git commit SHA

## Build Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `vite` | Dev server (port 5173, HMR, auto-open) |
| prebuild | `node scripts/generate-version.js` | Generate version info |
| build | `tsc -b && vite build` | Type-check (TS 7 Go binary) then bundle |
| lint | `NODE_OPTIONS='--require ./scripts/ts-eslint-resolve.cjs' eslint .` | Lint with TS 6 compat shim |
| preview | `vite preview` | Preview production build |
| postinstall | `node scripts/fix-tsc-bin.js` | Fix tsc binary after npm install |

## Platform
- **Dev:** Node.js >=22.19.0, npm, modern browser, Firebase project with Firestore + Auth
- **Prod:** Firebase Hosting + Firestore (Native mode) + Firebase Auth (Google)

## Charts Usage
MUI X Charts ^9.2.0 is used across **16+ components** in dashboard, analytics, investments, projections, budget, car, utilities, and salary pages. Components used: `BarChart`, `LineChart`, `PieChart`, `ChartsDataProvider`, `ChartsSurface`, `ChartsWrapper`, `ChartsTooltip`, `AreaPlot`, `LinePlot`, `ChartsAxis`, `ChartsGrid`, `ChartsLegend`. No Recharts or other chart library present.

## Related

- [[wiki/architecture/codebase-structure]]
- [[wiki/architecture/external-integrations]]
- [[wiki/conventions/coding-conventions]]
