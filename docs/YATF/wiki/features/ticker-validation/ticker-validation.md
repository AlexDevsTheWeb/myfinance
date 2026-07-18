---
type: Feature
description: "Yahoo Finance ticker validation triggered at broker config save."
title: "Yahoo Finance Ticker Validation"
tags: [feature, investment, validation, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/94-ticker-validation/94-ticker-validation.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "features/multi-broker-architecture", "plans/investment-tracking-v2-enhancements"]
---

# Feature: Yahoo Finance Ticker Validation

Status: implemented
Priority: low

## Description

Validate Yahoo Finance tickers at config save time to prevent broken API calls due to incorrect exchange suffixes. Implemented in Plan 12-05.

## What Was Built

### validateTicker (Blocking Regex Check)

- Regex: `/^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i`
- Allows US stocks (AAPL), European ETFs (SWDA.MI, VWCE.DE), and other common formats.
- Blocks save in BrokerSettingsModal if ticker doesn't match.

### validateTickerWithApi (Non-Blocking API Check)

- Optional test-fetch to yfin.dev after regex passes.
- Returns warning (non-blocking) if ticker cannot be verified — save proceeds regardless.
- Warns if API is unreachable or ticker returns no price data.

### Integration

- BrokerSettingsModal validates ticker on save: blocking regex pre-check, then fire-and-forget API verification.
- Ticker field shows error (blocking), helper text, and warning (non-blocking).
- `validation/index.ts` exports both functions.

## Implementation Notes

- Regex is permissive by design (D-11: "lightweight pre-check").
- Blocking on regex, non-blocking on API — user can save even if API unresponsive.
- Exchange suffixes `.MI` (Milan), `.DE` (Germany), `.L` (London) all supported.

## Files

- **Modified:** `investment.validation.ts`, `validation/index.ts`, `BrokerSettingsModal.tsx`, `en.json`, `it.json`

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/multi-broker-architecture/multi-broker-architecture]]
- [[wiki/plans/investment-tracking-v2-enhancements]]
- GitHub: [#94](https://github.com/AlexDevsTheWeb/myfinance/issues/94)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
