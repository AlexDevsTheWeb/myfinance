# [FEATURE] [FEATURE] Investment Tracking — Full CRUD for ETF Transactions & Broker Settings

> Source: GitHub Issue [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Add edit/delete capabilities for ETF transactions and full settings persistence for broker configuration.

## Current Limitation
Data mutation is destructive or restricted; mistakes require manual Firestore console intervention.

## Requirements
- **Transaction Table Actions:** Add `Edit` / `Delete` icons to the Holdings/Transactions table.
- **Safe Deletion Logic:** Deleting a transaction must trigger cascading state recalculation:
  - Revert the units from the Invested Capital pool
  - Recalculate Average Cost Basis (PMC) dynamically from remaining historical transactions
  - Restore corresponding capital to Broker Cash Balance
- **Settings Persistence:** Broker Settings modal must allow full updates without wiping historical snapshots.

## Related
- Source: [raw/ux-improvments.md](docs/YATF/raw/ux-improvments.md)
