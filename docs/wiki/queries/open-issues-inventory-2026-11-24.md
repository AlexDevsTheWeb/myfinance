---
type: Query
title: "Open GitHub Issues Inventory — 2026-11-24"
description: "All 26 open issues in AlexDevsTheWeb/myfinance, with a one-line summary, labels, staleness check and a proposed v1.0.0 milestone."
tags: [query, issues, backlog, milestone, triage]
created: 2026-11-24
updated: 2026-11-24
status: active
sources: ["raw/2026-11-24-versioning/2026-11-24-versioning.md"]
related: ["wiki/plans/v1.0.0-beta.1-release", "wiki/decisions/semver-1-0-adoption", "wiki/plans/go-to-market", "wiki/architecture/concerns-and-tech-debt"]
---

# Open GitHub Issues Inventory

**Date:** 2026-11-24
**Repository:** [AlexDevsTheWeb/myfinance](https://github.com/AlexDevsTheWeb/myfinance)
**Open issues:** 26 — 23 active, 3 close candidates

## Method

`gh issue list --state open --limit 200` for the list, then each body read in
full. The "state now" column was checked against the working tree, not taken
from the issue text, because several issues were written in July against files
that no longer exist. Milestones are a **proposal** for the next planning pass,
not a commitment.

Proposed milestones:

| Milestone | Theme |
|---|---|
| `v1.0.0-beta.2` | Safe to invite testers — data integrity, security, obvious correctness |
| `v1.0.0-beta.3` | Scale and polish — performance, offline/PWA, component splits |
| `v1.0.0` | GA — remaining user-facing features, umbrella epics, monetization |

## Active issues

| Issue # | Title | Labels | Summary | State now | Proposed milestone |
|---|---|---|---|---|---|
| [#189](https://github.com/AlexDevsTheWeb/myfinance/issues/189) | Migrate to npm workspaces monorepo | — | Track the move to `apps/web` + `apps/mobile` + `packages/shared`, then website and backend. | Phase 1 (`apps/web`) and the website shipped; Phases 2–4 remain. | `v1.0.0` (post-GA for mobile/API) |
| [#159](https://github.com/AlexDevsTheWeb/myfinance/issues/159) | No Firestore write rate limiting | — | Unlimited authenticated writes can exhaust the daily Firestore quota. | Unchanged; [[wiki/decisions/firestore-rate-limiting]] defers it to paid tier. | `v1.0.0` |
| [#139](https://github.com/AlexDevsTheWeb/myfinance/issues/139) | `[P2]` Transform webapp into PWA | feature, improvements | Manifest + service worker so Italian users can install it on a phone. | `site.webmanifest` exists (standalone, theme colour) but has one SVG icon, no `start_url`, no service worker and no 192/512 PNGs. | `v1.0.0-beta.3` |
| [#138](https://github.com/AlexDevsTheWeb/myfinance/issues/138) | `[P1]` Go-to-Market: secure → beta → monetize | feature, help wanted, improvements | Umbrella roadmap for turning Balancr into a SaaS. | Phase 0 and most of Phase 1 done; see [[wiki/plans/go-to-market]]. | Spans all — umbrella |
| [#136](https://github.com/AlexDevsTheWeb/myfinance/issues/136) | Move PAC tracking from localStorage to Firestore | fragile | `pac_last_{brokerId}` is device-local; PAC can double-fire or miss across devices. | Unchanged. | `v1.0.0-beta.3` |
| [#135](https://github.com/AlexDevsTheWeb/myfinance/issues/135) | Fix migration code in investment sync hook | fragile | `migrateBrokerConfig()` runs on every load, fire-and-forget, with no version guard. | Unchanged. | `v1.0.0-beta.2` |
| [#134](https://github.com/AlexDevsTheWeb/myfinance/issues/134) | Retry queue for historical snapshot writes | fragile | `recordPortfolioSnapshot()` can silently lose a snapshot on a failed write. | Unchanged. | `v1.0.0-beta.3` |
| [#133](https://github.com/AlexDevsTheWeb/myfinance/issues/133) | Backup/import reliability with Firestore transactions | fragile | `importAllData` replaces everything in one `updateDoc`; a failure can corrupt all data. | Unchanged. | `v1.0.0-beta.2` |
| [#132](https://github.com/AlexDevsTheWeb/myfinance/issues/132) | Fix static date range memo in DashboardPage | performance | `useMemo(..., [])` freezes the date range, so a dashboard left open past midnight is stale. | The original memo is gone, but `useDashboardMetrics` still reads `dayjs()` inside a memo without a time dependency, so the stale-across-midnight class survives. | `v1.0.0-beta.2` |
| [#131](https://github.com/AlexDevsTheWeb/myfinance/issues/131) | Optimize Firestore loading and write patterns | performance | Everything loads in memory; every mutation rewrites the whole array. | Partially addressed by subcollections; no pagination. | `v1.0.0-beta.3` |
| [#130](https://github.com/AlexDevsTheWeb/myfinance/issues/130) | Fix env var handling and document all vars | security | `getEnvVar` throws on a missing var, crashing startup; `VITE_REACT_APP_TITLE` is undocumented. | Unchanged. | `v1.0.0-beta.2` |
| [#129](https://github.com/AlexDevsTheWeb/myfinance/issues/129) | Strengthen Firestore rules and clean unused paths | security | Rules only check ownership — no field validation; dividend/tax subcollection rules are unused. | Unchanged. | `v1.0.0-beta.2` |
| [#128](https://github.com/AlexDevsTheWeb/myfinance/issues/128) | Fix duplicate sync hooks with race conditions | tech-debt | Three hooks run transactions and snapshots on the same document; `setAll` can clobber. | Unchanged. | `v1.0.0-beta.2` |
| [#125](https://github.com/AlexDevsTheWeb/myfinance/issues/125) | Extract duplicate portfolio computation | tech-debt | Holdings math is duplicated in three places with drift. | Unchanged; still listed in [[wiki/architecture/concerns-and-tech-debt]]. | `v1.0.0-beta.3` |
| [#124](https://github.com/AlexDevsTheWeb/myfinance/issues/124) | Split CarPage into components | tech-debt | One 693-line component mixes mileage, tyres, fuel analysis and charts. | Unchanged (693 lines). | `v1.0.0-beta.3` |
| [#122](https://github.com/AlexDevsTheWeb/myfinance/issues/122) | Split the monolithic Zustand store | tech-debt | `useFinanceStore.ts` holds every domain's state and Firestore logic. | Grew to ~1587 lines; types/validation/sanitisation extracted, the store split did not ship. | `v1.0.0` |
| [#112](https://github.com/AlexDevsTheWeb/myfinance/issues/112) | Privacy mode — eye toggle to mask euro values | feature | Hide absolute amounts globally while keeping percentages visible. | Not started. | `v1.0.0` |
| [#111](https://github.com/AlexDevsTheWeb/myfinance/issues/111) | Transaction fees field for ETF buy/sell | feature | Add `fees` to `IETFTransaction`, include it in totals and realised gains. | Not started. | `v1.0.0` |
| [#110](https://github.com/AlexDevsTheWeb/myfinance/issues/110) | Italian stamp duty and capital-loss tracking | feature | 0.20% stamp duty plus *zainetto fiscale* in the tax pocket. | Capital-gains tax shipped in V3; stamp duty and losses do not. | `v1.0.0` |
| [#109](https://github.com/AlexDevsTheWeb/myfinance/issues/109) | Per-ticker market pricing | feature | One `currentPrice` is applied to every holding — wrong for multi-broker portfolios. | Not started; high impact on valuations. | `v1.0.0` |
| [#58](https://github.com/AlexDevsTheWeb/myfinance/issues/58) | `[CRITICAL]` Missing critical features | feature | Backup schema versioning, export format stability, and other gaps. | Partially covered by subcollection work; no schema version field yet. | `v1.0.0` |
| [#57](https://github.com/AlexDevsTheWeb/myfinance/issues/57) | `[DEPS]` Dependencies at risk | feature | Firebase coupling, MUI X Pro licence, deprecated `standard-version`, `@dnd-kit` mismatch. | Unchanged. | `v1.0.0` |
| [#56](https://github.com/AlexDevsTheWeb/myfinance/issues/56) | `[SCALING]` Scaling limits | feature | 1 MiB document cap, in-memory state, no offline support. | Transactions and recurring moved to subcollections; pagination and virtualisation remain. | `v1.0.0` |

## Close candidates

These are open but the work they describe is already done or no longer applies.
Closing them is a maintainer action, listed here so the next planning pass does
not re-plan them.

| Issue # | Why it can close | Evidence |
|---|---|---|
| [#127](https://github.com/AlexDevsTheWeb/myfinance/issues/127) | Test infrastructure exists. | Vitest, jsdom, mocked Firebase, **301 tests / 17 files**; `npm test` is blocking in CI. See [[wiki/features/test-infrastructure/test-infrastructure]]. |
| [#137](https://github.com/AlexDevsTheWeb/myfinance/issues/137) | No browser `alert()`/`confirm()` remains. | `ConfigPage` was replaced by `SettingsPage`; `grep` finds no `window.alert`/`window.confirm` in `apps/web/src`. See [[wiki/features/mui-dialogs/mui-dialogs]]. |
| [#123](https://github.com/AlexDevsTheWeb/myfinance/issues/123) | `ConfigPage` no longer exists. | Replaced by `SettingsPage` in PR #201. The file is now 1509 lines, so if the size concern matters, open a narrower issue against `SettingsPage`. See [[wiki/features/settings-page-redesign/settings-page-redesign]]. |

## Notes for the next planning pass

- **`v1.0.0-beta.2` is small on purpose**: #129, #130, #132, #133, #135, #128.
  Five of the six are about not losing or corrupting a tester's data.
- **#138 and #189 are epics**, not tickets. Do not schedule them as a single
  unit; schedule their remaining sub-items.
- **#139 (PWA) conflicts with the mobile direction.** The React Native decision
  supersedes the PWA strategy, but the manifest already exists and a service
  worker is still the cheapest way to make the web app installable for the beta.
  Decide explicitly rather than leaving the issue open indefinitely.
- **#57 is a dependency review**, not a feature. `standard-version` is
  deprecated and is now the load-bearing tool for the SemVer switch; replacing
  it (e.g. `release-it` or `semantic-release`) is worth a separate decision.

## Related

- [[wiki/plans/v1.0.0-beta.1-release]] — the milestone this inventory follows
- [[wiki/decisions/semver-1-0-adoption]] — version scheme for the milestones
- [[wiki/plans/go-to-market]] — the roadmap behind #138
- [[wiki/architecture/concerns-and-tech-debt]] — code-level detail for the tech-debt rows
- Source: [raw/2026-11-24-versioning/2026-11-24-versioning.md](../../raw/2026-11-24-versioning/2026-11-24-versioning.md)
