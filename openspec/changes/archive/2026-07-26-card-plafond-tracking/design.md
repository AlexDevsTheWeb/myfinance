## Context

MyFinance supports multiple accounts (checking, savings, etc.). Users often have credit/debit cards linked to these accounts with monthly spending limits (plafond). The app currently has no concept of cards — all transactions are associated only with an account.

## Goals / Non-Goals

**Goals:**
- Allow users to register cards per account with name, type (credit/debit), plafond, and billing day
- Let users tag expenses with a card to track utilization
- Display per-card utilization on the dashboard: plafond, spent this period, available, progress bar
- Filter transactions by card on the transactions page
- Move sort controls to toggle buttons alongside the Clear button in the filter header

**Non-Goals:**
- Cards do not affect account balance computation
- No deferred payment logic for credit cards
- Income/refund card tagging deferred
- No card-specific charts or trends (basic utilization widget only)

## Decisions

### 1. Cards stored in UserDoc array
**Chosen:** Cards are stored as a `cards` array field on the Firestore `UserDoc`. Same pattern as `accounts`, `categories`, etc.

**Rationale:** Cards are metadata, not transactional data. Low cardinality (1-5 per account, max ~20 per user). Array field is simple and consistent with existing patterns.

### 2. `cardId` on transaction as optional string
**Chosen:** `cardId?: string` on `ITransaction`. Only set for expense transactions. Income and refund transactions leave it undefined.

**Rationale:** Simple optional field, backward compatible. No separate collection needed.

### 3. Card utilization computed client-side
**Chosen:** Utilization is computed as `SUM(expenses with cardId === X)` in the current billing period. Billing period is from `billingDay` of previous month to `billingDay` of current month.

**Rationale:** No server-side aggregation needed. All transactions are already loaded in the store. Computation is O(n) per card and runs on filtered data.

### 4. Sort controls as toggle buttons
**Chosen:** Replaced 4 separate asc/desc buttons with 2 toggle buttons (Date, Amount). Active field toggles direction on click; inactive field sets to desc on first click.

**Rationale:** Reduces UI clutter while maintaining full functionality. Matches common pattern in finance apps.

## Risks / Trade-offs

- **[Low] Billing day computation** — if no transactions exist in the current billing period, utilization shows 0. This is correct but may confuse users who expect to see "no card" as a state. Mitigation: show explicit "No transactions this period" when spent === 0.
- **[Low] Performance** — card utilization recalculates on every transaction change. With <10 cards and typical transaction volumes (<5000), this is negligible.
