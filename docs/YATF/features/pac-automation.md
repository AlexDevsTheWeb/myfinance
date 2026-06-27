---
title: "PAC Automation — Recurring Transactions"
tags: [feature, investment, automation, planned]
created: 2026-06-27
updated: 2026-06-27
status: planned
sources: ["raw/89-pac-automation/issue.md"]
related: ["features/investment-tracking", "plans/investment-tracking-v2-enhancements"]
---

# Feature: PAC Automation — Recurring Transactions

Status: planned
Priority: medium

## Description

Automate the monthly PAC buy transactions so the user doesn't have to manually log a `Buy` transaction every month.

## Requirements

- **Deterministic Automated Generation:** Background worker or initialization hook (Zustand/Firestore) checks current date against configured PAC day
- **Virtual Ledger:** Auto-generate `System-Generated Buy` transaction when execution day has passed
- **Cash Balance Impact:** Auto-decrement Broker Cash Balance, increment Invested Capital (or pending status)
- **User Confirmation UI:** Badge: *"1 automated PAC transaction pending confirmation"* — user approves/adjusts price

## Related

- [[features/investment-tracking]]
- [[plans/investment-tracking-v2-enhancements]]
- GitHub: [#89](https://github.com/AlexDevsTheWeb/myfinance/issues/89)
- Source: [raw/89-pac-automation/issue.md](raw/89-pac-automation/issue.md)
