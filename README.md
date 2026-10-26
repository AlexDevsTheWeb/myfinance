# Balancr

Balancr is a personal finance tracker for people who want more than a spreadsheet:
transactions, recurring items, budgets, a savings-rate engine, car costs, and a
full investment portfolio with projections.

> Formerly published as **YAFT** (Yet Another Finance Tracker). The wiki still
> uses that name in older entries — it is the same project.

## Features

- **Dashboard** — balance, income/expense recap, account breakdown, net-worth trend.
- **Transactions** — full CRUD, filters, category customization.
- **Recurring transactions** — monthly/yearly items with optional end dates.
- **Budgets & savings rate** — targets, progress tracking, investment bridge.
- **Investments** — ETF portfolio, multi-broker, PAC automation, dividends,
  capital-gains tax, historical snapshots, ticker validation.
- **Projections** — compound-interest simulator with inflation and tax modeling.
- **Car & utilities** — mileage, tire tracking, utility bills.
- **Cloud sync** — Firebase Auth + Firestore, with export/restore.

## Tech Stack

- React 19 + Vite + TypeScript 7
- Material UI with a custom dark theme
- Zustand (persisted stores)
- Firebase Auth + Firestore
- Vitest + Testing Library
- Day.js, i18next

## Getting Started

```bash
npm install          # installs workspaces + postinstall fixes
npm run hooks:install # enable the pre-commit wiki validation gate
npm run dev          # http://localhost:5173
```

Create a `.env` at the **repository root** with the `VITE_FIREBASE_*` variables
listed in [`AGENTS.md`](AGENTS.md#firebase-setup).

## Repository Layout

```
apps/web/       the Balancr app
apps/website/   marketing site (separate Firebase Hosting target)
packages/       shared packages
scripts/        build helpers
docs/           knowledge bundle — raw/ sources + wiki/ compiled pages
.claude/skills/ agent skills (OpenCode + Claude Code)
```

## Documentation

The project keeps a persistent, interlinked wiki instead of scattered notes:

- [`docs/index.md`](docs/index.md) — catalog of every page
- [`docs/AGENTS.md`](docs/AGENTS.md) — how the bundle is structured and maintained
- [`docs/wiki/architecture/`](docs/wiki/architecture/) — system design
- [`docs/wiki/conventions/branch-strategy.md`](docs/wiki/conventions/branch-strategy.md) — branch and PR rules

Validate the bundle with `npm run docs:validate`.

## Contributing

1. Branch off `development` as `feat/YATF-<n>` or `fix/YATF-<n>`.
2. Write atomic conventional commits.
3. Document the change in `docs/` (raw note + wiki page) and validate it.
4. Open a PR against `development`.

## License

Personal project. All rights reserved.
