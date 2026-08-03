# GitHub Issue #168 — credit|debit card counter doesn't work

**URL:** https://github.com/AlexDevsTheWeb/myfinance/issues/168
**Author:** @AlexDevsTheWeb (Alessandro Torri)
**Created:** 2026-08-03
**Status:** OPEN
**Labels:** bug
**Related feature:** [165-card-plafond-tracking](../../165-card-plafond-tracking/165-card-plafond-tracking.md)

---

## Summary

On the home page, the Card Utilization widget (the per-card "spent / plafond" counter) always shows `€0` spent for every credit/debit card, even when expenses have been tagged with a card.

The reporter suspects it stopped working after renaming the saved cards ("Carta Credito" / "Carta Debito").

## Original Report

> in the home page the counter for credit card or debit card is not working, the value is always 0.
> we should investigate, at the beginning it was working, maybe because I've changed the name of the credit and debit cards saved?

---

## Investigation

### What is the "counter"?

The home page (`src/pages/DashboardPage.tsx`) renders `RecapCards` (`src/components/dashboard/RecapCards.tsx`). The only card-related element is the **Card Utilization** widget, which renders one row per card showing:

```
<card name> [CREDIT|DEBIT]     €spent / €plafond
<progress bar>                 €available
```

`spent` is the number that is stuck at `0`.

### How `spent` is computed (`RecapCards.tsx`, `cardUtilization` useMemo)

```ts
const cardUtilization = React.useMemo(() => {
    return cards.map(card => {
        const resetDay = card.billingDay;
        const now = dayjs();
        let periodStart: dayjs.Dayjs;
        let periodEnd: dayjs.Dayjs;

        if (now.date() >= resetDay) {
            periodStart = now.date(resetDay).startOf('day');
            periodEnd = now.add(1, 'month').date(resetDay).startOf('day');
        } else {
            periodStart = now.subtract(1, 'month').date(resetDay).startOf('day');
            periodEnd = now.date(resetDay).startOf('day');
        }

        const spent = transactions
            .filter(t =>
                t.type === 'expense' &&
                t.cardId === card.id &&
                dayjs(t.date).isAfter(periodStart) &&   // <-- STRICT AFTER
                dayjs(t.date).isBefore(periodEnd)        // <-- STRICT BEFORE
            )
            .reduce((sum, t) => sum + t.amount, 0);
        ...
    });
}, [cards, transactions]);
```

### Root cause: off-by-one boundary exclusion on the reset day

The billing window is computed as `(periodStart, periodEnd)` — **exclusive of the start date** — because both `isAfter(periodStart)` and `isBefore(periodEnd)` are strict.

`periodStart` is the current billing cycle's start, i.e. the card's `billingDay` of the current month (default `billingDay = 1`).

Therefore **every expense dated exactly on the billing reset day is silently dropped** from the spent counter:

- A transaction dated `2026-08-01` (reset day) → `isAfter(Aug 1 00:00)` is `false` → excluded.
- A transaction dated `2026-08-01` is also excluded from the *previous* period `(Jul 1, Aug 1)` because `isBefore(Aug 1 00:00)` is `false`.

So expenses on the 1st of the month are **never** counted in any period.

### Why the counter looks "always 0"

The card feature shipped on **2026-07-26** (commit `420cb8d`, PR #166/#167). The reporter tagged card expenses in late July and saw correct values while the window was `(Jul 1, Aug 1)`.

On **Aug 1** the window rolled to `(Aug 1, Sep 1)`:

1. All late-July expenses fell outside the new window (correct rollover behavior).
2. Any new August expenses made **on the 1st** are excluded by the off-by-one bug.
3. Result: the widget shows `€0` until a card expense is dated strictly after the 1st.

The monthly rollover on the reset day is the natural "reset", but combined with the boundary bug the counter appears permanently stuck at 0.

### Renaming the cards — red herring?

No name-based matching exists in the codebase. Every match is by **card ID**:

- `RecapCards.tsx`: `t.cardId === card.id`
- `TransactionsPage.tsx` filter: `t.cardId === cardFilter`
- `TransactionForm.tsx` dropdown: `<MenuItem value={card.id}>`

Renaming via the **Edit** dialog (`ConfigPage.tsx` → `handleSaveCard`) preserves the card `id` (spread from `editingCard`), and `updateCard` in the store maps by `id`. So a pure rename does **not** orphan transactions.

**However:** if the reporter *deleted* the old cards and *re-added* them under new names, new `crypto.randomUUID()` ids are generated, and pre-existing transactions keep pointing at the old ids → spent is 0 for the new cards. This is a data-level possibility and should be verified (check Firestore `users/{uid}.cards` ids vs `transactions/{id}.cardId`) if the boundary fix does not resolve the symptom.

### Evidence

Simulation with the exact production logic (`billingDay = 1`, "today" = 2026-08-03):

| Transaction | Date | Expected | Code result |
|---|---|---|---|
| Jul 28 | outside window | — | excluded ✓ |
| Aug 01 | inside window (reset day) | counted | **excluded ✗ (bug)** |
| Aug 02 | inside window | counted | counted ✓ |

The Aug 1 expense (reset day) is the one that should count but is dropped.

---

## Proposed Fix

Make the billing window **inclusive of the start** and **exclusive of the end**: `[periodStart, periodEnd)`.

Replace the strict `isAfter` / `isBefore` with timestamp comparisons (no dayjs plugin needed):

```ts
const spent = transactions
    .filter(t =>
        t.type === 'expense' &&
        t.cardId === card.id &&
        dayjs(t.date).valueOf() >= periodStart.valueOf() &&
        dayjs(t.date).valueOf() < periodEnd.valueOf()
    )
    .reduce((sum, t) => sum + t.amount, 0);
```

This counts expenses on the billing reset day while keeping the next period's start exclusive (no double counting).

## Files

| File | Change |
|------|--------|
| `src/components/dashboard/RecapCards.tsx` | `cardUtilization`: inclusive start boundary for spent filter |
