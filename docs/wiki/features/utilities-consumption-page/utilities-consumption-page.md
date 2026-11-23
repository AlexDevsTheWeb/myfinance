---
type: Feature
title: "Utilities & Consumption Page"
description: "Full rebuild of /utilities: period and utility filters, four KPI cards with unit rates and fixed-vs-energy split, dual-axis spend/consumption chart, seasonal YoY overlay, and a dense bill ledger with CSV export."
tags: [feature, frontend, utilities, ui, ledger]
created: 2026-11-23
updated: 2026-11-23
status: implemented
sources: ["raw/2026-11-23-utilities/2026-11-23-utilities.md"]
related: ["wiki/features/transaction-ledger-redesign/transaction-ledger-redesign", "wiki/features/add-transaction-drawer/add-transaction-drawer", "wiki/architecture/store-architecture", "wiki/features/localization/localization"]
---

# Feature: Utilities & Consumption Page

Status: implemented
Priority: high

## Description

`/utilities` was rebuilt as a single analytical surface for metered household
utilities — electricity, gas and water. It shows what the household spent, how
much physical volume that bought, the effective price per unit, how much of each
bill is fixed versus consumption, and how the current year compares with the
previous one.

Before this change the page was two tabs (electricity, gas) with four simple
cards, a history table and one line chart. Water was not supported, there was no
cross-utility view, no fixed/energy split and no Year-over-Year comparison.

## Structure

```
apps/web/src/
├── pages/UtilitiesPage.tsx                     # filters, scopes, presets, CSV, dialogs
└── components/utilities/
    ├── UtilitiesFilterHeader.tsx               # year pills, utility segmented control, YoY switch, CTA
    ├── UtilitiesSummaryCards.tsx               # total + electricity + gas + water KPIs
    ├── UtilitiesAnalyticsCharts.tsx            # stacked bars + consumption line, YoY overlay
    ├── UtilitiesTable.tsx                      # dense bill ledger, sort, search, pagination, actions
    ├── utilities.utils.ts                      # classification, aggregation, series, duplicate (+ tests)
    ├── types.ts                                # UtilityType filter/period/sort and palette
    └── index.ts
```

## Data model

The original model stored only a generic `consumption` plus an optional reading
period. This implementation adds **optional** fields to `ITransaction` — no
migration, no required field, and documents written before it read back fine:

| Field | Purpose |
|---|---|
| `utilityType?: 'electricity' \| 'gas' \| 'water'` | Explicit kind; survives category renames |
| `fixedFee?: number` | Fixed quota of the bill, in EUR |
| `energyFee?: number` | Consumption quota of the bill, in EUR |
| `provider?: string` | Supplier / contract (Enel Energia, Plenitude, …) |
| `meterId?: string` | POD (electricity), PDR (gas) or the water service code |

They are persisted through `sanitizeTransaction`, the Firestore
`transactionConverter` (both directions) and the legacy-array backfill in
`store/sync`. See [[wiki/architecture/store-architecture]].

When `utilityType` is absent — every bill recorded before today — the kind is
inferred from category/subcategory keywords (`Elettricità`, `Electricity`,
`Luce` → electricity; `Gas`, `Metano` → gas; `Acqua`, `Water` → water). Bills
without a meter concept (phone, TV, internet) are deliberately not utilities.

## Behaviour

| Element | Behaviour |
|---|---|
| Year pills | Every year that contains a utility bill, newest first, plus **Tutti**. Defaults to the current year. |
| Utility filter | **Tutte le Utenze** / **Luce (kWh)** / **Gas (SMC)** / **Acqua (m³)**. |
| YoY switch | Enables the seasonal comparison. Disabled when the period is *Tutti* or the utility filter is mixed, because the comparison needs one year and one physical unit. |
| CTA | `+ Nuova Bolletta / Lettura` opens the global `AddTransactionDrawer` with the bill category (and the matching subcategory when a single utility is selected) pre-filled and the utility block expanded. |
| KPI — total | Period spend, bill count and a YoY delta badge against the previous year (hidden for *Tutti*). |
| KPI — per utility | Spend, physical volume (kWh / SMC / m³), weighted average rate (`€/unit`) and the fixed-vs-energy share of the bills that recorded a split. |
| Chart A | Stacked bars in EUR (fixed quota in slate, energy quota in the utility accent) plus a line for physical volume on a right axis. The line is omitted in the mixed view, where kWh, SMC and m³ cannot share an axis. Hovering a month shows total bill, fixed quota, energy quota, volume and effective unit price. |
| Chart B | Twelve monthly consumption curves: selected year versus the previous one. Shown only when the YoY switch is on. |
| Table | Date + billing period, supplier/contract, utility badge, total, fixed quota, energy quota, metered volume, effective price, meter and actions. Sortable by date and amount; search covers description, supplier, meter and subcategory. |
| Row actions | Edit (global drawer), Duplicate, Delete (confirmation dialog). |
| Export | CSV of the filtered set — `;` separator, decimal comma, UTF-8 BOM, explicit unit column. |
| Pagination | Client-side, 10/25/50/100 rows, windowed page numbers, page index clamped during render. |

## Semantics worth knowing

- **KPI cards follow the period, not the utility filter.** They are the period's
  breakdown; the utility filter scopes the charts and the ledger. This keeps the
  four cards comparable while the analysis narrows.
- **Unit rates are weighted**: period spend ÷ period volume, not an average of
  the per-bill rates. Averaging rates over-weights small bills.
- **A split is derived when only one quota is entered.** Fixed only → energy =
  total − fixed; energy only → fixed = total − energy; neither → the bill is
  treated as pure energy so the stacked bars still add up to the spend. Bills
  without a recorded split are excluded from the fixed/energy share and from the
  split denominator.
- **Duplicate is a template for the next bill.** It keeps description, category,
  subcategory, amount, type, account, card, utility kind, supplier and meter, and
  clears the volume, reading period and both quotas.
- **Water is now a default bill subcategory** for new users
  (`DEFAULT_CATEGORIES`), alongside `Elettricità` and `Gas`. Existing users keep
  their stored category list and can add `Acqua` themselves.
- **The drawer is the only creation surface.** The page never writes a form of
  its own; it seeds the shareable drawer through the new
  `useUiStore.openTransactionDrawer(type, transaction, preset)` third argument.

## Deviations from the request

| Request | Shipped | Why |
|---|---|---|
| New fields `kwh`, `smc`, `waterM3`, `fixedFee`, `energyFee` | One `utilityType` + the existing generic `consumption`, plus `fixedFee` / `energyFee` | Three parallel volume fields would triple validation, persistence and sanitisation for the same number; the kind selects the unit |
| Hard-coded Italian strings | `utilities.*` keys in both `it.json` and `en.json` | The app is localized; hard-coded Italian would break the English UI |
| Page header with title | Subtitle only | The shell's `TopBar` owns the page title since the 2026-10-26 header change |
| Add `/utilities` to `App.tsx` / `Sidebar.tsx` | No routing change | The route and the module-gated sidebar entry already existed |
| `docs/reports/PR-[NUMBER]-utilities-page.md` | `wiki/features/utilities-consumption-page/report-2026-11-23.md` | Wiki convention supersedes the older `docs/reports/` path |
| Separate "Fornitore / Contratto" and "Azienda / Contatore (POD/PDR)" columns | Supplier column + meter column | Both map onto the two new fields; "azienda" had no distinct data source |
| Unit cost to 3 decimals | 4 decimals for kWh/SMC/m³, 3 for litres | Metered utility rates are routinely sub-cent (e.g. `0,2841 €/kWh`) |

## Verification

- `npx tsc -b apps/web` — clean
- `npm test` — **301 tests / 17 files** green, including new suites for the
  utilities helpers (classification, split, aggregation, series, duplicate,
  presets) and the extended drawer/sanitisation tests
- `npm run build` — green (pre-existing chunk-size warning only)
- `npm run lint` — 6 errors / 3 warnings, the unchanged baseline; the new code
  adds none

**Not verified:** a real-browser pass. Charts, the custom tooltip, the drawer
preset and the CSV download are covered only by unit tests and the production
build — no visual or E2E harness exists.

## Related

- [[wiki/features/transaction-ledger-redesign/transaction-ledger-redesign]] — the ledger patterns reused here (dense table, page window, CSV)
- [[wiki/features/add-transaction-drawer/add-transaction-drawer]] — now carries the utility quota, supplier and meter fields
- [[wiki/architecture/store-architecture]]
- [[wiki/features/localization/localization]]
- Implementation report: [[wiki/features/utilities-consumption-page/report-2026-11-23]]
- Source: [raw/2026-11-23-utilities.md](../../../raw/2026-11-23-utilities/2026-11-23-utilities.md)
