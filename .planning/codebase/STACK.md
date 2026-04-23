# Technology Stack

**Analysis Date:** 2026-04-23

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code in `src/`
- JavaScript ESNext - React/Node compatibility

## Runtime

**Environment:**
- Node.js (via Vite dev server)
- Browser runtime (React SPA)

**Package Manager:**
- npm - Lockfile: `package-lock.json` (not shown)
- Module type: ES Modules (`"type": "module"` in `package.json`)

## Frameworks

**Core:**
- React 19.2.4 - UI framework
- React Router DOM 7.13.0 - Client-side routing
- Zustand 5.0.11 - State management

**UI Component Libraries:**
- @mui/material 7.3.8 - Material Design components
- @mui/icons-material 7.3.8 - Material icons
- @mui/x-date-pickers 8.27.0 - Date picker components
- @mui/x-date-pickers-pro 8.27.0 - Pro date picker features
- lucide-react 0.564.0 - Icon library
- recharts 3.7.0 - Charting library

**Drag & Drop:**
- @dnd-kit/core 6.3.1 - Drag and drop primitives
- @dnd-kit/sortable 10.0.0 - Sortable list components
- @dnd-kit/utilities 3.2.2 - DnD utilities

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server
- @vitejs/plugin-react 5.1.4 - React plugin for Vite

**Testing:**
- Not configured - No test suite present

## Key Dependencies

**Firebase (Backend):**
- firebase 12.9.0 - Firebase SDK for Auth + Firestore

**Utilities:**
- dayjs 1.11.19 - Date manipulation
- @emotion/react 11.14.0 - CSS-in-JS (MUI dependency)
- @emotion/styled 11.14.1 - Styled components (MUI dependency)

## Configuration

**Environment:**
- Environment variables loaded via `getEnvVar()` utility
- Required vars: `VITE_FIREBASE_*` prefixed
- Config source: `src/lib/firebase.ts`

**Build:**
- Build config: `vite.config.ts`
- TypeScript configs: `tsconfig.json` (references), `tsconfig.app.json`, `tsconfig.node.json`
- Linting config: `eslint.config.js`

**TypeScript Settings:**
- Target: ES2022
- Strict mode: enabled
- Module resolution: bundler
- JSX: react-jsx

## Platform Requirements

**Development:**
- Node.js (latest)
- npm
- Port 5173 (Vite dev server)

**Production:**
- Static hosting (Firebase compatible)
- Environment variables required at runtime

---

*Stack analysis: 2026-04-23*