---
type: Feature
description: "Automated recurring PAC transactions with user confirmation UI."
title: "PAC Automation — Recurring Transactions"
tags: [feature, investment, automation, implemented]
created: 2026-06-27
updated: 2026-06-27
status: implemented
sources: ["raw/89-pac-automation/89-pac-automation.md", "raw/12-investment-tracking-v2/implementation.md"]
related: ["features/investment-tracking", "plans/investment-tracking-v2-enhancements", "features/crud-etf-transactions"]
---

# Feature: PAC Automation — Recurring Transactions

Status: implemented
Priority: medium

## Description

Automate the monthly PAC buy transactions with user confirmation workflow. Implemented in Plan 12-05 (hook + dialog + notification).

## What Was Built

### usePacAutomation Hook

- **Init hook** checks each broker's `monthlyPacAmount > 0` on mount.
- Compares current date vs configured PAC day (default: 1st of month).
- **Triple guard** prevents duplicate generation:
  - `useRef` guard (`hasChecked.current`) — prevents HMR duplicate (Pitfall 2 fix)
  - `localStorage` per-broker tracking (`pac_last_{id}`) — persists across sessions
  - Store `lastPacGenerationDate` — secondary in-memory check
- Only one pending PAC generated at a time (break after first match).

### PacConfirmationDialog

- MUI Dialog showing broker name, amount, date with Confirm/Dismiss buttons.
- Confirm calls `confirmPacTransaction` (stub in Plan 12-03, creates buy with "System-Generated Buy" description).
- Dismiss calls `dismissPacTransaction` — clears pending state for the month.

### PAC Badge Notification (D-07)

- InvestmentPage shows "PAC Pending" button with MUI `Badge` (warning `!`) when `pendingPacTransaction` is set.
- Clicking opens `PacConfirmationDialog`.

## Implementation Notes

- PAC day default = 1st of month; per-broker config deferred to future.
- `confirmPacTransaction` is wired in Plan 12-03 store actions — fetches current price and creates buy transaction.
- Tax on nominal gains only (inflation adjustment does not affect tax computation).

## Files

- **Created:** `src/hooks/usePacAutomation.ts`, `src/components/investment/PacConfirmationDialog.tsx`
- **Modified:** `InvestmentPage.tsx`, `useInvestmentStore.ts`, `en.json`, `it.json`

## Related

- [[wiki/features/investment-tracking/investment-tracking]]
- [[wiki/features/crud-etf-transactions/crud-etf-transactions]]
- [[wiki/plans/investment-tracking-v2-enhancements]]
- GitHub: [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89)
- Source: [raw/12-investment-tracking-v2/implementation.md](raw/12-investment-tracking-v2/implementation.md)
