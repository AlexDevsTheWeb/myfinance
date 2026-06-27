# [FEATURE] [FEATURE] Investment Tracking — Yahoo Finance Ticker Validation

> Source: GitHub Issue [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Validate Yahoo Finance tickers at config save time to prevent broken API calls.

## Current Limitation
Tickers differ by stock exchange (e.g., Milan .MI vs Xetra .DE). Manual entry can cause broken API calls.

## Requirements
- Implement a validation regex or quick test-fetch when saving broker configurations.
- Ensure the user-entered ticker is valid and reachable on Yahoo Finance.
- Support localized exchange suffixes (.MI, .DE, etc.).

## Related
- Source: [raw/ux-improvments.md](docs/YATF/raw/ux-improvments.md)
