---
type: Bug
title: "Card utilization counter shows €0 — billing period boundary bug"
description: "Home page Card Utilization widget always shows €0 spent because expenses dated on the billing reset day are excluded by strict isAfter/isBefore window bounds."
resource: "https://github.com/AlexDevsTheWeb/myfinance/issues/168"
tags: [bug, dashboard, cards, plafond]
created: 2026-08-03
updated: 2026-08-03
status: fixed
severity: major
sources: ["raw/bugs/card-counter-zero/card-counter-zero.md"]
related: ["wiki/features/card-plafond-tracking/card-plafond-tracking.md"]
---

# Bug: Card utilization counter shows €0

Status: **fixed**
Severity: **major**

## Symptom

On the home page, the **Card Utilization** widget (per-card `spent / plafond` counter) always shows `€0` spent for every credit/debit card, even when expenses have been tagged with a card.

Reporter suspects it broke after renaming the saved cards.

## Reproduction

1. Create a card with default `billingDay = 1` (calendar month) under an account.
2. Add an expense tagged with that card on a date **equal to the reset day** (e.g. the 1st of the month).
3. Open the home page → Card Utilization shows `€0` for that card.
4. A transaction on any day strictly after the reset day does count.

## Root Cause Analysis

In `src/components/dashboard/RecapCards.tsx` (`cardUtilization` memo), the billing window is built as `(periodStart, periodEnd)` and the spent filter uses strict `isAfter(periodStart)` **and** strict `isBefore(periodEnd)`.

`periodStart` is the current cycle's `billingDay` of the current month (default 1). Any expense dated exactly on that day fails `isAfter` for the current window and also fails `isBefore` for the previous window — so **reset-day expenses are never counted in any period**.

After the natural monthly rollover (Aug 1), late-July expenses fall out of the window and any new expense on the 1st is dropped by the bug → the counter appears permanently stuck at `€0`.

Renaming cards via the Edit dialog preserves card `id` (all matching is by ID, not name), so a pure rename is a red herring. If cards were **deleted + re-created** (new `crypto.randomUUID()` ids), old transactions become orphaned — a data-level possibility to verify if the fix doesn't resolve the symptom.

## Fix

Made the billing window inclusive of the start: `[periodStart, periodEnd)` by replacing the strict `isAfter`/`isBefore` with timestamp comparisons in `src/components/dashboard/RecapCards.tsx`.

```ts
dayjs(t.date).valueOf() >= periodStart.valueOf() &&
dayjs(t.date).valueOf() < periodEnd.valueOf()
```

This counts expenses on the billing reset day while keeping the next period's start exclusive (no double counting).

### Verification

- Simulation of the production logic confirms reset-day expenses now count (e.g. Aug 1 + Aug 2 → 500, previously 300 missing the Aug 1 expense).
- `npm run build` passes (0 type errors); `npm run lint` shows no new issues in `RecapCards.tsx`.

## Related

- [[wiki/features/card-plafond-tracking/card-plafond-tracking]] — the feature this bug belongs to
- Source: [raw/bugs/card-counter-zero/card-counter-zero.md](raw/bugs/card-counter-zero/card-counter-zero.md)
