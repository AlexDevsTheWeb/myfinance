# AGENTS.md - MyFinance Development Notes

## Commands

```bash
npm run dev      # Start dev server (port 5173)
npm run build    # TypeScript build + Vite build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Build Order

`npm run build` runs `tsc -b && vite build` — typecheck happens before bundling.

## Firebase Setup

Requires `.env` file with `VITE_FIREBASE_*` variables. See `src/lib/firebase.ts` for required keys:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Route pages (Dashboard, Transactions, etc.)
- `src/store/` - Zustand state stores
- `src/lib/` - Firebase config and utilities
- `src/theme/` - MUI theme configuration

## Branch Workflow

See `docs/YATF/conventions/branch-strategy.md` for full rules.

TL;DR: Never commit to `development`/`main` directly. Branch as `feat/YATF-{n}` or `fix/YATF-{n}`. PR to `development`.

## Notes

- No test suite exists in this repo
- No pre-commit hooks configured
- TypeScript uses project references (`tsconfig.json` references `tsconfig.app.json`)
- LLM Wiki lives in `docs/YATF/` — see `docs/YATF/AGENTS.md` for schema

## Wiki Discipline

Every new feature, bug analysis, implementation, or decision **must be documented**:

1. Write raw notes to `docs/YATF/raw/` — each analysis in its own subfolder (e.g. `raw/<topic>/<topic>.md`)
2. Ask to ingest into the wiki — the LLM will process it into `docs/YATF/wiki/`, update `docs/YATF/index.md`, cross-link related pages, and append to `docs/YATF/log.md`
3. Commit changes to `development`