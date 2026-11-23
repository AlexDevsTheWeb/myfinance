---
type: Feature
title: "Settings Page Redesign"
description: "SettingsPage (formerly ConfigPage) with a 240px sub-sidebar nav on desktop and scrollable pills on mobile, entity creation via shared right drawers, theme-token surfaces and monospaced figures."
tags: [feature, settings, ui, frontend]
created: 2026-10-26
updated: 2026-10-26
status: implemented
sources: ["raw/2026-10-UI-refactor/2026-10-26-settings.md", "raw/2026-10-UI-refactor/2026-10-26-settings.html"]
related: ["wiki/features/add-transaction-drawer/add-transaction-drawer", "wiki/features/card-plafond-tracking/card-plafond-tracking", "wiki/features/user-configurable-rates/user-configurable-rates", "wiki/architecture/system-architecture"]
---

# Feature: Settings Page Redesign

Status: implemented
Priority: high

## Description

`pages/ConfigPage.tsx` became `pages/SettingsPage.tsx` — **same `/config`
route and sidebar entry** — with a sub-sidebar layout instead of seven top tabs.
The content and store wiring are unchanged: this is a layout and interaction
redesign, not new functionality.

## Structure

```
apps/web/src/
├── pages/SettingsPage.tsx            # state, handlers, tab panels
└── components/settings/
    ├── SettingsNav.tsx               # 240px rail (md+) / scrollable pills (xs)
    ├── EntityDrawer.tsx              # shared right slide-over
    ├── categoryColor.ts              # deterministic colour from the name
    └── settings.styles.ts            # surfaces + monospaced figures
```

Input styling is shared with the transaction drawer through
`components/shared/form.styles.ts`.

## Navigation

| Breakpoint | Layout |
|---|---|
| `md` and up | Sticky 240px rail, active row highlighted with a cyan left bar and accent text |
| below `md` | Horizontally scrollable `Tabs` |

Both render from one `SettingsSection[]`, so the two layouts cannot drift.
Sections carry counts as pills: accounts, expense categories, income categories
and recurring templates.

The seven sections are unchanged: General, Accounts, Expense categories, Income
categories, Recurring, Projections, Backup.

## Entity creation

Account, category, subcategory and card create/edit open in the shared
`EntityDrawer`: 480px on desktop, full viewport on mobile, pinned header and
footer with `env(safe-area-inset-bottom)` padding, and `keepMounted={false}` so
the recurring form does not exist while the drawer is closed. The recurring
template form opens in the same shell but keeps its own field layout.

Destructive flows stay as dialogs: delete-and-remap, backup preview and account
deletion are confirmations, not creation.

## Regional settings

The General tab shows language (functional), currency and date format. Currency
is a disabled `EUR (€)` field — the app is EUR-only — and the date format is a
preview of `t('dateFormat')`, which follows the language.

## Categories

Categories carry no colour or icon in the model. Each card shows a colour dot
derived deterministically from the category name, and each subcategory a smaller
dot of the same colour. The value is stable across sessions and devices and needs
no migration. Drag-to-move subcategories between categories already existed and
is unchanged.

## Fidelity pass (same PR)

A second pass aligned the page with the Stitch export and fixed three gaps:

- **Global TopBar.** `TopBar` moved from `components/dashboard/` to
  `components/layout/` and now renders on every non-dashboard page; the
  breadcrumb row was removed. It gained the currency chip and the user avatar.
- **Draft save.** Language, module toggles and the balance start date are edited
  as a draft and applied by **Salva modifiche**; **Reimposta predefiniti** loads
  the defaults into the draft. While the draft is untouched it re-baselines from
  the store, so Firestore hydration landing after first paint cannot be
  overwritten by saving defaults. Entity CRUD stays immediate.
- **Account IBAN.** `IAccount` gained an optional `iban`, editable in the account
  drawer and displayed masked (`IT28 •••• •••• 9012`) on the tile.
- **Layout density.** 220px rail with the new labels and text badges
  (`4 Attivi`), regional preferences as a 2×2 card, modules as 2×2 rich cards,
  accounts and cards as 2×2 tiles with monospaced balances.

## Shell & page titles

The global `TopBar` carries the **page title on the left** and the **search field
centred**, with the currency chip, notifications and the primary CTA pinned to the
right edge. There is no avatar in the bar. The title comes from a route map
inside `TopBar`, so there is one place to change a label.

Titles were removed from page content on every page — dashboard, transactions,
finance/insights/salary, investments, budget, car, utilities and settings — which
leaves each page's subtitle and actions in place. The dashboard no longer renders
its own TopBar: the shell is identical everywhere. Below `md` the bar keeps the
compact mobile header with the hamburger, and the search is hidden.

The title is width-clipped at `md`/`lg` so it cannot run underneath the centred
search field. Because that cap stops `flex: 1` from filling the row, the
right-hand cluster carries `margin-left: auto` — without it the capped title
leaves a gap and the actions drift toward the centre.

### Grid detail pass (v2)

The second Stitch pass added the details the first one missed:

- **One CTA per section.** `+ Nuovo Conto / Carta` opens a menu with *Account*
  and *Card*, matching the export's single button instead of two side by side.
- **Inset summary rows.** Account tiles gained a `SALDO INIZIALE` row and card
  tiles a `PLAFOND` row, both on `colors.surfaceNested` with a monospaced figure
  — the export's `flex items-baseline justify-between` block.
- **Section icons.** Regional, modules, accounts and cards headers now carry a
  cyan icon, as in the export.
- **Card tiles** show the linked account as `Appoggio: <account>`.

Two v2 items were intentionally not followed, because they reverse earlier
decisions: the in-content breadcrumb/title (the title lives in the TopBar) and a
duplicate accounts grid inside the General tab (accounts have their own tab).
`CHECKING` / `BROKER` badges were dropped: they appear only in the prompt, not in
the Stitch export, and the account model has no type.

### Content frame

Main-content padding now lives in one place: the layout `Container` applies
`px/py { xs: 2, md: 3 }` (16px / 24px) to **every** page, dashboard included.
Pages no longer own root padding, so the dashboard and settings finally share a
gutter, and the ledger no longer sits 16px further from the edge than the home
page. The dashboard's previous full-bleed container and the per-page `p` / `pb`
values were removed, and the dead `pageTitle` prop on `Layout` went with them.

## Deviations from the request

| Request | Shipped | Why |
|---|---|---|
| Category icons + drag-and-drop reorder | colour dot; existing move-between-categories kept | `ICategory` has no icon or order field; reordering needs persisted order |
| Baseline Growth Rate % | omitted | nothing consumes it; a stored-but-unused setting is worse than none |
| Currency selector | disabled `EUR (€)` | app is EUR-only |
| Date format selector | preview only | format follows the language |
| Broker creation drawer | `BrokerSettingsModal` kept | investment-specific flow outside the four agreed drawers |

## Related

- [[wiki/features/add-transaction-drawer/add-transaction-drawer]] — the drawer pattern this reuses
- [[wiki/features/card-plafond-tracking/card-plafond-tracking]]
- [[wiki/features/user-configurable-rates/user-configurable-rates]]
- [[wiki/architecture/system-architecture]]
- Implementation report: [[wiki/features/settings-page-redesign/report-2026-10-26]] (includes the fidelity pass)
- Source: [prompt](../../../raw/2026-10-UI-refactor/2026-10-26-settings.md), [HTML export](../../../raw/2026-10-UI-refactor/2026-10-26-settings.html)
