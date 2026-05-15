# Technology Stack

**Analysis Date:** 2026-05-03

## Languages

**Primary:**
- TypeScript 5.9.3 - Used throughout the codebase for type-safe React development

**Secondary:**
- CSS - Used for component styling in `src/index.css` and `src/App.css`

## Runtime

**Environment:**
- Node.js - Development and build runtime

**Package Manager:**
- npm - Version determined by system
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React 19.2.4 - UI library for building the finance dashboard
- React Router DOM 7.13.0 - Client-side routing for navigation between pages

**UI Framework:**
- Material UI (MUI) 7.3.8 - Component library with custom theming
- MUI Icons 7.3.8 - Icon set for UI elements
- MUI X Date Pickers 8.27.0 - Date selection components
- MUI X Date Pickers Pro 8.27.0 - Advanced date picker features

**State Management:**
- Zustand 5.0.11 - Lightweight state management for auth and finance data stores

**Build/Dev:**
- Vite 7.3.1 - Build tool and dev server with React plugin
- TypeScript 5.9.3 - Type checking and build
- ESLint 9.0.0 - Code linting with TypeScript support
- TypeScript ESLint 8.55.0 - TypeScript-aware linting rules

## Key Dependencies

**UI Components:**
- @dnd-kit/core 6.3.1 - Drag and drop functionality
- @dnd-kit/sortable 10.0.0 - Sortable list components
- @dnd-kit/utilities 3.2.2 - Drag and drop utilities
- lucide-react 0.564.0 - Icon library
- recharts 3.7.0 - Charting library for financial visualizations

**Data & Utilities:**
- dayjs 1.11.19 - Date manipulation library
- firebase 12.9.0 - Firebase SDK for authentication and database

**Internationalization:**
- i18next 26.0.8 - Internationalization framework
- i18next-browser-languagedetector 8.2.1 - Browser language detection
- react-i18next 17.0.4 - React bindings for i18next

**Development:**
- @types/node 25.2.3 - Node.js type definitions
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @vitejs/plugin-react 5.1.4 - Vite React plugin
- eslint-plugin-react-hooks 7.0.1 - React hooks linting rules
- eslint-plugin-react-refresh 0.5.0 - React refresh support for Vite

## Configuration

**Environment:**
- Vite environment variables via `import.meta.env`
- Firebase configuration via `VITE_FIREBASE_*` environment variables
- Environment files: `.env`, `.env.development`, `.env.production`

**Build:**
- TypeScript project references: `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`
- Vite configuration in `vite.config.ts`
- ESLint flat config in `eslint.config.js`

## Platform Requirements

**Development:**
- Node.js (latest)
- npm for package management
- Vite dev server on port 5173

**Production:**
- Static build via Vite (`dist/` directory)
- Firebase hosting (implied by Firebase configuration)