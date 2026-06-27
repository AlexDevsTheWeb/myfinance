---
title: "Yahoo Finance Ticker Validation"
tags: [feature, investment, validation, planned]
created: 2026-06-27
updated: 2026-06-27
status: planned
sources: ["raw/94-ticker-validation/issue.md"]
related: ["features/investment-tracking", "plans/investment-tracking-v2-enhancements"]
---

# Feature: Yahoo Finance Ticker Validation

Status: planned
Priority: low

## Description

Validate Yahoo Finance tickers at config save time to prevent broken API calls due to incorrect exchange suffixes.

## Requirements

- Implement a validation regex or quick test-fetch when saving broker configurations
- Ensure the entered ticker is valid and reachable on Yahoo Finance
- Support localized exchange suffixes (`.MI`, `.DE`, etc.)

## Related

- [[features/investment-tracking]]
- [[plans/investment-tracking-v2-enhancements]]
- GitHub: [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89) .. [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94)
- Source: [raw/94-ticker-validation/issue.md](raw/94-ticker-validation/issue.md)
