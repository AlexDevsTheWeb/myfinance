# Card Selection for Recurring Expenses

**Date:** 2026-08-03
**Status:** Design approved — pending implementation
**Branch:** `feat/recurring-card-selection`
**Related:** [wiki/features/card-plafond-tracking/card-plafond-tracking] (Issue #165)

## Summary

Extend the card selection capability introduced by Card Plafond Tracking (#165) to **recurring expenses**. Today a user can pick "None" (directly on bank account), a credit card, or a debit card for one-off expenses, but recurring expense templates (`IRecurringTransaction`) have no `cardId` field — every generated recurring expense is created without a card, so it never counts toward card utilization and is invisible in the Transactions card filter.

## Problem

- `IRecurringTransaction` has no `cardId` field.
- `TransactionForm` hides the card dropdown for recurring entries (`type === 'expense' && !isRecurring`).
- `checkRecurring()` generates expense transactions without a `cardId`.
- `sanitizeRecurring` and the Firestore converters drop any card field.
- Recurring subscriptions (Netflix, Google One, Spotify, gym, etc.) are exactly the kind of predictable, monthly spending that belongs on a card plafond — they are currently untrackable.

## Requirements

1. Add optional `cardId?: string` to `IRecurringTransaction` (optional so existing templates default to "None"; no migration needed).
2. Show the existing card dropdown in the recurring expense dialog (value: None / account's cards).
3. Persist `cardId` on the recurring template (Firestore converters + sanitization).
4. `checkRecurring()` copies the template's `cardId` onto each generated expense transaction.
5. Recurring list items in ConfigPage show the associated card name when set.
6. Scope decision: changing a template's card affects **future generations only** — already-generated transactions are NOT backfilled.

## Design

### Data model

```ts
interface IRecurringTransaction {
  // existing fields...
  cardId?: string;  // NEW — omitted/undefined means "None" (bank account directly)
}
```

No migration: templates written before this change simply have no `cardId` (or `null`), which is equivalent to "None".

### Data flow

1. **ConfigPage recurring dialog** → `TransactionForm` renders the card dropdown for `type === 'expense'` (gate no longer includes `!isRecurring`). Account change already resets the card.
2. **Save** → `handleConfirm` includes `cardId: recurringForm.cardId || undefined` in the payload → `addRecurring`/`updateRecurring` → Firestore.
3. **Generation** → `checkRecurring()` spreads the template `cardId` onto each generated transaction, including the dedup/`existsInPeriod` matching (unchanged).
4. **Downstream** → generated transactions carry `cardId`, so they automatically appear in:
   - Card Utilization widget (dashboard, `RecapCards`)
   - Card filter in Transactions (`TransactionsPage`)
   - Card plafond computation (SUM of expenses per card in billing period)
   - Backup/restore (via the transaction store, already covered)

### Files to touch

| File | Change |
|------|--------|
| `src/store/types/finance.types.ts` | Add `cardId?: string` to `IRecurringTransaction` |
| `src/components/forms/TransactionForm.tsx` | Show card dropdown for recurring expenses (remove `!isRecurring` gate) |
| `src/pages/ConfigPage.tsx` | `recurringForm.cardId` state + init on add/edit + include in save payload + show card name in list item |
| `src/store/useFinanceStore.ts` | `checkRecurring()` copies `payload.cardId` to generated transactions |
| `src/store/sanitization/recurring.ts` | Sanitize `cardId` |
| `src/lib/converters.ts` | Include `cardId` in recurring write/read mapping |

### Verification

- `npm run build` passes clean (typecheck + bundle).
- Manual: create a recurring expense with a card, reload → generated transaction carries the card, appears in Card Utilization and the Transactions card filter. Existing recurring templates without a card still generate "None" transactions.

## Decisions

- **Future-only generation** (no backfill): the user chose this — editing a template's card must not mutate past generated transactions, keeping history consistent.
- **Reuse existing card dropdown** rather than building a new control; behavior is identical to one-off expenses ("None" = directly on bank account).
- **No separate GitHub issue** yet; tracked on branch `feat/recurring-card-selection`.

## Alternative approaches considered (from brainstorming)

- **A (chosen):** Store `cardId` on the template, propagate at generation. Simple, explicit, matches how one-off expenses work.
- **B (rejected):** Infer card at generation time from category→card rules. Implicit magic, adds a new settings surface, no user control.
- **C (rejected):** Per-account default card fallback. Addresses the wrong problem — the user wants per-template control, and a fallback would silently attribute spending to the wrong card.
