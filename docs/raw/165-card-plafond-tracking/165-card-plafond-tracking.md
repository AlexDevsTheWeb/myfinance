# GitHub Issue #165 — Card Plafond Tracking

**URL:** https://github.com/AlexDevsTheWeb/myfinance/issues/165
**Author:** @AlexDevsTheWeb
**Created:** 2026-07-26
**Status:** OPEN
**Labels:** feature

---

## Summary

Add the ability to configure **cards** (credit/debit) per account with a monthly plafond (spending limit), mark transactions with the card used, and display card utilization on the dashboard.

This is purely a **spending awareness / categorization** feature — it does **not** change how account balances are computed. Cards are just metadata + plafond tracking.

All transactions still hit the account balance as before. The card field on a transaction only answers "which card did I use to pay?" — no deferred payment logic, no accounting changes.

---

## Requirements

### Data Model — ICard (new entity)

```typescript
interface ICard {
  id: string;
  name: string;              // e.g. "Carta Credito", "Carta Debito"
  type: "credit" | "debit";
  plafond: number;           // monthly spending limit in EUR
  billingDay: number;        // day of month the plafond resets (default: 1, range: 1-28)
  accountId: string;         // parent account reference
}
```

### Data Model — ITransaction (extension)

```typescript
interface ITransaction {
  // ...existing fields
  cardId?: string;           // optional — which card was used (only on expenses)
}
```

### Plafond computation

For a given card in the current billing period (from `billingDay` of previous month to `billingDay` of current month):

```
spent     = SUM(expenses with cardId === X in billing period)
plafond   = card.plafond
available = plafond - spent
usage%   = (spent / plafond) × 100
```

### Scope limitations (deferred)

- **Income/refund on cards** — rare case, deferred to future iteration
- **Card payment reconciliation** — paying the credit card bill is out of scope
- **Per-card category breakdown** — deferred
- **Notifications/plafond alerts** — deferred

---

## Settings UI (Config → Accounts tab)

Each account in the accounts list gets a "Cards" sub-section:

```
┌─ Conto Principale ────────────────────┐
│  Initial Balance: €0                  │
│                                       │
│  Cards:                               │
│  ├─ Carta Credito    Plafond: €3.000  │
│  │  (credit · resets day 1)           │
│  ├─ Carta Debito     Plafond: €1.500  │
│  │  (debit · resets day 15)           │
│  └─ [+ Add Card]                      │
└───────────────────────────────────────┘
```

Per card row:
- Card name, type badge, plafond display
- Reset day shown in parentheses
- Edit (pencil icon) → opens dialog to modify all fields
- Delete (trash icon) → confirmation dialog, blocked if card is linked to existing transactions

**Add/Edit Card dialog:**
- Name (text field)
- Type (toggle/select: credit | debit)
- Plafond (number input, in EUR)
- Reset day (number input, 1-28, default 1)

---

## Transaction Form Changes

When creating/editing a transaction of type `expense`:
- If the selected `accountId` has cards configured, show a **"Card"** dropdown with the account's cards + "None" (default) option
- If no cards exist for that account, the field is hidden
- If the transaction type changes from `expense` to `income`/`transfer`, clear the `cardId` and hide the field
- Editing an existing transaction: pre-select the saved card

---

## Dashboard Changes

New **Card Utilization** widget showing per-card:

```
┌────────────────────────────────────────────────┐
│  💳 Card Utilization                           │
│                                                │
│  Carta Credito                     €1.200/€3.000│
│  ████████████░░░░░░░░░░░░░░░░  40%  €1.800 av.│
│                                                │
│  Carta Debito                       €450/€1.500│
│  █████░░░░░░░░░░░░░░░░░░░░░░░  30%  €1.050 av.│
│                                                │
└────────────────────────────────────────────────┘
```

Each card shows:
- Card name with type icon
- Spent / Plafond numerical display
- Progress bar with percentage
- Available amount

Layout: fits alongside existing `RecapCards` or as a new row below stat cards.

---

## Data Storage

- **Cards array** stored in the Firestore user document (`users/{userId}.cards`)
- Same pattern as `accounts`, `categories` — an array on the user doc
- Firestore converter: simple array converter (no subcollection needed)
- Sync: handled by existing `useSyncFinance` `onSnapshot` on user doc

### Backup/Export

- Cards included in the JSON backup/restore
- Migration: existing user docs without `cards` field get empty array (Firestore default)

---

## Files to touch

| File | Change |
|------|--------|
| `src/store/types/finance.types.ts` | Add `ICard` interface, add `cardId` to `ITransaction` |
| `src/store/defaults.ts` | Add empty `cards` array to default user data |
| `src/store/useFinanceStore.ts` | Add cards CRUD actions, update transaction save to include `cardId` |
| `src/store/sanitization/sanitization.ts` | Ensure `cardId` is sanitized on transaction write |
| `src/lib/converters.ts` | Map `cards` field in user doc converter |
| `src/pages/ConfigPage.tsx` | Add "Cards" sub-section per account in Accounts tab |
| `src/components/dashboard/` | New `CardUtilization` component |
| `src/pages/DashboardPage.tsx` | Render `CardUtilization` widget |
| `src/components/forms/TransactionForm.tsx` | Add card dropdown conditional on account cards |

---

## Design Decisions

1. **Cards as part of account, not separate** — cards belong to an account, nested under it in the UI and in the data model via `accountId`
2. **No balance impact** — card does not change how account balances are computed. This keeps the feature simple and non-invasive
3. **Calendar-month billing by default** — `billingDay` defaults to 1 (calendar month). Custom days 2-28 supported for cards with non-standard cycles
4. **Only expenses** — income transactions can't be linked to a card (deferred for future refund use cases)
