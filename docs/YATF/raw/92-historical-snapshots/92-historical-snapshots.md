# [FEATURE] [FEATURE] Investment Tracking — Historical Portfolio Snapshot Persistence

> Source: GitHub Issue [#92](https://github.com/AlexDevsTheWeb/myfinance/issues/92)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Persist portfolio value snapshots to Firestore so historical charts survive cache clears and work across devices.

## Current Limitation
Historic prices are not stored; the chart uses the value at the time each snapshot was recorded. If the user clears local state or switches devices, historical performance is lost.

## Requirements
- Implement a daily or monthly task that saves computed Net Worth and ETF Value into a `portfolio_history` collection in Firestore.
- Ensure robust, persistent, multi-device charting.

## Related
- Source: [raw/ux-improvments/ux-improvments.md](raw/ux-improvments/ux-improvments.md)
