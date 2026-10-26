# AGENTS.md — Balancr / MyFinance

Project notes for AI agents and humans. **This file is the entry point; the
knowledge base lives in [`docs/`](docs/).**

- Wiki schema, ingest workflow, OKF conventions → [`docs/AGENTS.md`](docs/AGENTS.md)
- Page catalog → [`docs/index.md`](docs/index.md)
- Recent activity → `tail -30 docs/log.md`

Claude Code reads [`CLAUDE.md`](CLAUDE.md), which imports this file.

## Commands

```bash
npm run dev              # Dev server (port 5173)
npm run build            # tsc -b && vite build (typecheck first)
npm run lint             # ESLint
npm run preview          # Preview the production build
npm test                 # Vitest (apps/web)
npm run docs:validate    # Validate the docs/ knowledge bundle
npm run hooks:install    # Enable the pre-commit wiki validation gate
```

## Repository Layout

`npm` workspaces monorepo:

- `apps/web/` — the Balancr app (React 19 + Vite + MUI + Zustand + Firebase)
- `apps/website/` — marketing site (separate Firebase Hosting target)
- `packages/` — shared packages (when present)
- `scripts/` — build helpers (`generate-version.js`, `fix-tsc-bin.js`, `ts-eslint-resolve.cjs`)
- `docs/` — the knowledge bundle (`raw/` sources → `wiki/` compiled pages)
- `.claude/skills/` — agent skills (shared by OpenCode and Claude Code)

## Firebase Setup

Requires a `.env` at the **repo root** (Vite `envDir` points there). See
`apps/web/src/lib/firebase.ts` for the required keys:

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`

## Branch Workflow

Authoritative rules: [`docs/wiki/conventions/branch-strategy.md`](docs/wiki/conventions/branch-strategy.md).

TL;DR — never commit to `development` or `main` directly. Branch as
`feat/YATF-<n>` or `fix/YATF-<n>` (kebab-case slug when there is no issue), then
PR to `development`.

## Wiki Discipline

Every feature, bug analysis, implementation, or decision **must** be documented:

1. Raw notes go to `docs/raw/<topic>/<topic>.md`.
2. Compiled pages go to `docs/wiki/<category>/` (`features`, `bugs`, `decisions`,
   `plans`, `architecture`, `conventions`, `queries`, `references`).
3. Update `docs/index.md`, the category index, and append to `docs/log.md`.
4. Run `npm run docs:validate` — the pre-commit hook enforces it.

Agents: load the `wiki-sync` skill for the full procedure and the `issue-to-pr`
skill for the end-to-end delivery loop.

## Notes

- TypeScript 7 (Go rewrite) with project references; `scripts/fix-tsc-bin.js`
  runs on `postinstall` to keep the `tsc` binary on TS 7.
- Lint uses `@typescript/typescript6` through an npm override, because the TS 7
  Go binary does not expose the JS API yet.
- Tests: Vitest, co-located `*.test.ts(x)` under `apps/web/src`.
- CI lives in `.github/workflows/` (typecheck, lint, test, Firebase deploy).
