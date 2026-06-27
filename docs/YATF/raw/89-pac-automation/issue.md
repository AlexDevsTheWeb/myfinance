# [FEATURE] [FEATURE] Investment Tracking — Automated PAC Recurring Transactions

> Source: GitHub Issue [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Automate the monthly PAC buy transactions so the user doesn't have to manually log a `Buy` transaction every month.

## Current Limitation
The user must manually log a `Buy` transaction every month, even though the PAC is statically configured in the settings.

## Requirements
- **Deterministic Automated Generation:** Implement a background worker or initialization hook (via Zustand/Firestore) that checks the current date against the configured PAC day.
- **Virtual Ledger:** If the real date has passed the execution day, auto-generate a `System-Generated Buy` transaction.
- **Cash Balance Impact:** Auto-decrement the Broker Cash Balance and increment Invested Capital based on latest fetched market price (or pending status until prices update).
- **User Confirmation UI:** Notification badge: *\"1 automated PAC transaction pending confirmation\"* allowing the user to approve/adjust the purchase price.

## Related
- Source: [raw/ux-improvments.md](docs/YATF/raw/ux-improvments.md)
