---
type: Plan
description: "Project roadmap with phases, status, and priorities across all milestone areas."
title: "Project Roadmap"
tags: [plans, roadmap, project]
created: 2026-06-22
updated: 2026-10-26
status: active
sources: ["raw/ROADMAP/ROADMAP.md", "raw/archive/gsd/ROADMAP.md"]
related: ["wiki/architecture/project-state", "wiki/architecture/concerns-and-tech-debt", "wiki/references/legacy-planning-archive", "wiki/features/car-management-redesign/car-management-redesign"]
---

# Roadmap: MyFinance — Personal Finance Tracker

*Refreshed 2026-10-26 against the shipped code. The original phase tracker lives
in [`raw/archive/gsd/ROADMAP.md`](../../raw/archive/gsd/ROADMAP.md); the mapping
from every archived plan to its wiki page is in
[[wiki/references/legacy-planning-archive]].*

## Overview

Personal finance tracker on Firebase Auth + Firestore: multi-account
transactions, recurring items, budgets, investment portfolio with projections,
car and utility tracking. Now an npm-workspaces monorepo (`apps/web`,
`apps/website`).

## Completed Phases

| Phase | Completed | Priority | Where it lives now |
|---|---|---|---|
| 01 Firebase Security Rules | 2026-04-23 | Critical | `firestore.rules`, [[wiki/architecture/external-integrations]] |
| 02 Error Handling | 2026-04-23 | High | [[wiki/features/error-boundary/error-boundary]], [[wiki/features/loading-states/loading-states]], [[wiki/features/mui-dialogs/mui-dialogs]] |
| 03 Input Validation | 2026-04-23 | High | [[wiki/architecture/store-architecture]] (validation module) |
| 06 FAB Navigation | 2026-04-26 | Medium | [[wiki/features/quick-actions-fab/quick-actions-fab]] |
| 07 UI Layout Refinement | 2026-05 | Medium | [[wiki/features/dashboard-redesign/dashboard-redesign]], [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]], [[wiki/features/sidebar-redesign/sidebar-redesign]] |
| 08 Year Selector Inline | 2026-05 | Medium | `YearSelector.component.tsx` used by Insights, Car, Utilities |
| 09 Language i18n | 2026-05-02 | High | [[wiki/features/localization/localization]] |
| 10 Investment Tracking | 2026-06 | Medium | [[wiki/features/investment-tracking/investment-tracking]], [[wiki/architecture/investment-tracking-architecture]] |
| 11 Financial Projections | 2026-06 | Medium | [[wiki/features/financial-projections/financial-projections]], [[wiki/architecture/financial-projections-architecture]] |
| 12 Investment Tracking V2 | 2026-06-27 | High | [[wiki/plans/investment-tracking-v2-enhancements]] |

## Partially Shipped

### Phase 04: Backup & Restore — partial

Export/import to JSON with preview exists in ConfigPage, but the audit in
[[wiki/plans/backup-restore-data-coverage]] found six entity groups missing from
the payload (budget targets and investment data among them). Treat the feature as
usable but incomplete: a restore today does not round-trip everything.

## Not Started

### Phase 05: Cloud Backup (Google Drive)

Planned only — no code. Intent: auto-detect Google-authenticated users, upload
the existing backup payload to Drive, expose a "Save to Google Drive" action.
Only local export/restore shipped. Recorded in
[[wiki/references/legacy-planning-archive]] so it is not mistaken for a gap.

## Beyond the Phase Tracker

- **Monorepo migration** — [[wiki/plans/monorepo-migration]] (Phases 1 and 5
  shipped; 2–4 open)
- **Go-to-market** — [[wiki/plans/go-to-market]],
  [[wiki/plans/beta-launch-playbook]]
- **Tech debt** — [[wiki/architecture/concerns-and-tech-debt]],
  [[wiki/architecture/store-architecture]] (unfinished store split),
  [[wiki/features/analytics-insights/analytics-insights]] (unwired filter bar)

## Related

- [[wiki/architecture/project-state]]
- [[wiki/references/legacy-planning-archive]]
- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/car-management-redesign/car-management-redesign]]
- [[wiki/architecture/concerns-and-tech-debt]]
- [[wiki/plans/italian-tax-enhancements]]
