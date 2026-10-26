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
- Implementation report: [[wiki/features/settings-page-redesign/report-2026-10-26]]
- Source: [prompt](../../../raw/2026-10-UI-refactor/2026-10-26-settings.md), [HTML export](../../../raw/2026-10-UI-refactor/2026-10-26-settings.html)
