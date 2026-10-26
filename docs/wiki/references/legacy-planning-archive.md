---
type: Reference
title: "Legacy Planning Archive"
description: "Map of every retired GSD, OpenSpec, Superpowers and session-handoff document to the wiki page that now carries its knowledge — plus the items that were planned but never shipped."
tags: [reference, archive, planning, gsd, openspec, superpowers]
created: 2026-10-26
updated: 2026-10-26
status: active
sources: ["raw/archive/README.md", "raw/archive/gsd/", "raw/archive/openspec/", "raw/archive/superpowers/", "raw/archive/session-handoff/"]
related: ["wiki/decisions/wiki-reorganization", "wiki/plans/roadmap", "wiki/architecture/store-architecture", "wiki/features/analytics-insights/analytics-insights", "wiki/features/localization/localization", "wiki/features/quick-actions-fab/quick-actions-fab"]
---

# Legacy Planning Archive

The project ran three planning systems before settling on this wiki. On
2026-10-26 their folders were retired and their source documents moved to
`docs/raw/archive/` (see [[wiki/decisions/wiki-reorganization]]).

This page is the index that makes the archive safe to ignore: **every archived
document is either summarized by a wiki page listed below, or explicitly recorded
as never shipped.** Raw sources are kept for provenance; the wiki is the
compiled artifact.

## GSD phases (`raw/archive/gsd/phases/`)

| Archived phase | Now documented in |
|---|---|
| 01 Firebase security rules | `firestore.rules` + [[wiki/architecture/external-integrations]] + [[wiki/bugs/firestore-rules-drift]] |
| 02 Error handling | [[wiki/features/error-boundary/error-boundary]], [[wiki/features/loading-states/loading-states]], [[wiki/features/mui-dialogs/mui-dialogs]] |
| 03 Input validation | [[wiki/architecture/store-architecture]] (validation module), [[wiki/conventions/coding-conventions]] |
| 04 Backup & restore | [[wiki/plans/backup-restore-data-coverage]] |
| 05 Cloud backup (Google Drive) | **Not shipped** — see below |
| 06 FAB navigation | [[wiki/features/quick-actions-fab/quick-actions-fab]] |
| 07 UI redesign | [[wiki/features/dashboard-redesign/dashboard-redesign]], [[wiki/features/sidebar-redesign/sidebar-redesign]], [[wiki/features/transaction-layout-improvement/transaction-layout-improvement]] |
| 08 Year selector move | [[wiki/plans/roadmap]] (completed 2026) — small header-alignment change, no dedicated page |
| 09 Language i18n | [[wiki/features/localization/localization]] |
| 10 Investment tracking | [[wiki/features/investment-tracking/investment-tracking]], [[wiki/architecture/investment-tracking-architecture]] |
| 12 Investment tracking v2 | [[wiki/plans/investment-tracking-v2-enhancements]], [[wiki/features/multi-broker-architecture/multi-broker-architecture]], [[wiki/features/crud-etf-transactions/crud-etf-transactions]], [[wiki/features/pac-automation/pac-automation]], [[wiki/features/historical-snapshots/historical-snapshots]], [[wiki/features/tax-inflation-modeling/tax-inflation-modeling]], [[wiki/features/ticker-validation/ticker-validation]] |

`ROADMAP.md` and `STATE.md` in the same folder are the GSD-era phase tracker;
[[wiki/plans/roadmap]] is the live replacement.

## OpenSpec (`raw/archive/openspec/`)

| Archived spec | Now documented in |
|---|---|
| `card-plafond-tracking` | [[wiki/features/card-plafond-tracking/card-plafond-tracking]] |
| `pac-state-persistence` | [[wiki/features/pac-automation/pac-automation]] |
| `recurring-dedup` | [[wiki/bugs/recurring-transaction-duplicates-same-period]] |
| `transaction-sub-collection` | [[wiki/features/recurring-subcollection-scaling/recurring-subcollection-scaling]], [[wiki/bugs/transactions-array-write-back]] |
| `go-to-market-phase-0` change | [[wiki/features/error-boundary/error-boundary]], [[wiki/features/loading-states/loading-states]], [[wiki/features/mui-dialogs/mui-dialogs]], [[wiki/plans/go-to-market]] |

The four specs under `specs/` are the original behavioural contracts. Where a
wiki page and a spec disagree, the wiki page reflects the shipped code and the
spec is the historical intent.

## Superpowers (`raw/archive/superpowers/`)

| Archived document | Status |
|---|---|
| Store refactor design + plan (issue #46) | Partially shipped → [[wiki/architecture/store-architecture]] |
| Analytics charts design + branch plans 1–4 (issue #37) | Shipped with changes → [[wiki/features/analytics-insights/analytics-insights]] |
| Test infrastructure design + phase-1 plan (issue #127) | Shipped → [[wiki/features/test-infrastructure/test-infrastructure]], [[wiki/architecture/testing-status]], [[wiki/conventions/testing-guide]] |

## Session handoff and prototypes

| Archived document | Now documented in |
|---|---|
| `session-handoff/session-handoff.md` (2026-07-12) | [[wiki/plans/go-to-market]], [[wiki/plans/beta-launch-playbook]], [[wiki/decisions/firestore-rate-limiting]], the Phase 0/1 feature pages |
| `local-scratch/agent_hub.py`, `run_agent.sh` | Replaced by `.claude/skills/issue-to-pr` — early prototype of the same issue → wiki → PR loop |

## Planned, never shipped

Recorded so the ideas are not rediscovered as gaps:

1. **Cloud backup to Google Drive** (GSD phase 05). Plans exist for Google-auth
   detection and an upload button; only local export/restore shipped. The wiki
   roadmap still lists it as a planned phase.
2. **Budget vs Actual chart** — explicitly deferred out of issue #37.
3. **Store domain-module split** — `modules/transactionModule.ts` and friends
   were designed but never created; `useFinanceStore.ts` remains monolithic. See
   [[wiki/architecture/store-architecture]].
4. **Analytics filter bar** — `AnalyticsFilters.tsx` exists and is exported but
   nothing renders it; Insights filters by year only.
5. **FAB on the dashboard** — deliberately excluded; the dashboard keeps its own
   entry points.

## Related

- [[wiki/decisions/wiki-reorganization]]
- [[wiki/plans/roadmap]]
- Archive index: [raw/archive/README.md](../../raw/archive/README.md)
