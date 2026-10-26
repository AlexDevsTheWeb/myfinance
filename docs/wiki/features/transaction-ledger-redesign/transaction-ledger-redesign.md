---
type: Feature
title: "Transaction Ledger Redesign"
description: "Full-width redesign of /transactions: three KPI cards, a one-row filter toolbar, a dense sortable table with row actions, CSV export, column toggles and client-side pagination — built from the Stitch prototype."
tags: [feature, frontend, transactions, ui, ledger]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/2026-10-UI-refactor/2026-10-26-prompt.md", "raw/2026-10-UI-refactor/2026-10-26-prompt.html"]
related: ["wiki/features/transaction-layout-improvement/transaction-layout-improvement", "wiki/architecture/store-architecture", "wiki/features/localization/localization"]
---

# Feature: Transaction Ledger Redesign

Status: implemented
Priority: high

## Description

The `/transactions` page was rebuilt as a full-width **ledger**: summary KPIs on
top, a single-row filter toolbar, and a dense, sortable table with row actions and
pagination — matching the Stitch prototype exported on 2026-10-26.

It replaces the two-column layout described in
[[wiki/features/transaction-layout-improvement/transaction-layout-improvement]]
(filter card + pie chart on the left, table on the right), which is now
superseded.

## Structure

```
apps/web/src/
├── pages/TransactionsPage.tsx              # layout, filtering, metrics, export
└── components/ledger/
    ├── LedgerSummaryCards.tsx              # inflow / outflow / fixed recurring
    ├── LedgerFilterToolbar.tsx             # period pills + 4 selectors + search
    ├── LedgerTransactionsTable.tsx         # dense table, row menu, pagination
    ├── ledger.utils.ts                     # period range, recurring math, page window
    ├── types.ts                            # LedgerPeriod, LedgerSort, column visibility
    └── index.ts
```

Data comes from `useFinanceStore` (transactions, accounts, cards, categories,
recurring templates) and `useBudgetStore` (budget targets). No new Firestore
collections or fields were introduced.

## Behaviour

| Element | Behaviour |
|---|---|
| Summary cards | Inflow and outflow over the selected period (period + account + card, ignoring text/category filters). Inflow trend compares against the previous window of equal length. Recurring card sums active expense templates as a monthly equivalent (yearly ÷ 12) and shows the next charge date. |
| Budget bar | Shown only when at least one `monthly` budget target exists; percentage = outflow ÷ monthly targets. |
| Period pills | Current month · last 90 days · calendar year · custom (reveals two date pickers). |
| Filters | Search, category, dependent subcategory, account, card (incl. "without card"), type (all / recurring / one-off). Reset shows the active-filter count. |
| Table | Sortable by date and amount. Columns: date, description + category, account + card, type badge, amount, actions. Category, account and type columns can be hidden; the choice persists in `localStorage` under `balancr.ledger.columns`. |
| Row actions | **Edit** (existing modal), **Duplicate**, **Delete** (confirmation dialog). |
| Duplicate | Creates a new one-off transaction dated **today**, copying description, category, subcategory, amount, type, account and card. It deliberately drops `recurringLinkId`, `consumption` and meter readings — see `duplicateTransaction` in [[wiki/architecture/store-architecture]]. |
| Export CSV | Exports the **filtered** set (not just the current page): UTF-8 BOM, `;` separator, decimal comma, RFC 4180 quoting. Chosen so Italian Excel opens it without an import wizard. |
| Pagination | Client-side, 10/25/50/100 rows, windowed page numbers. The page index is clamped during render rather than in an effect, to avoid cascading renders. |

## Deviations from the prototype

The prototype was a Tailwind export for a MUI **v5** codebase and referenced
`src/` paths that no longer exist. What changed and why:

1. **MUI v9, no Tailwind.** All classes were converted to `sx` and theme tokens
   (`colors.surface`, `colors.cyan`, `theme.colors.mono`, …). The tokens were
   already in `theme/theme.ts` from the dashboard redesign.
2. **The shell is reused, not rebuilt.** Sidebar and top bar come from
   `components/layout/Layout.tsx`; only page content was implemented.
3. **Search lives in the toolbar.** The prototype had a global search in the top
   bar; this app's shell has none, so dropping it would have been a functional
   regression.
4. **Two type badges instead of four.** The data model has `recurringLinkId` and
   `frequency: 'monthly' | 'yearly'` — there is no "Bimestrale" or "PAC
   Automatico" concept. Badges therefore read *Ricorrente* / *Una Tantum*,
   matching the type filter.
5. **Account column shows real data.** The prototype's "SDD Diretto" / "Bonifico
   In" labels have no counterpart; the column renders the account name plus the
   card name when present.
6. **No screenshot.** `Screenshot 2026-10-26 alle 12.48.55.png` was not in the
   repository, so the HTML export was the only visual reference.

## Files changed

- `apps/web/src/pages/TransactionsPage.tsx` — rewritten
- `apps/web/src/components/ledger/*` — new
- `apps/web/src/utils/csv.utils.ts` (+ test) — new
- `apps/web/src/store/useFinanceStore.ts` — `duplicateTransaction` added
- `apps/web/src/locales/{it,en}.json` — `transactions.ledger.*` keys

## Verification

- `npx tsc -b` clean; `npm run build` succeeds
- `npx vitest run` — 221 tests / 14 files green, including new suites for the CSV
  builder, the ledger pure helpers and `duplicateTransaction`
- `npm run lint` — 7 errors / 3 warnings, all pre-existing in untouched files
  (`CarPage.tsx`, `store/sync/index.ts`); the new code adds none
- **Not verified:** pixel comparison against the prototype in a browser — no
  screenshot was available and no visual-diff tooling exists in the repo

## Related

- [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]] (superseded)
- [[wiki/architecture/store-architecture]]
- [[wiki/features/localization/localization]]
- Prototype: [prompt](../../../raw/2026-10-UI-refactor/2026-10-26-prompt.md), [HTML export](../../../raw/2026-10-UI-refactor/2026-10-26-prompt.html)
