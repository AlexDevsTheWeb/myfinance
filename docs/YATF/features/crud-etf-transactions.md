---
title: "ETF Transactions CRUD & Settings Persistence"
tags: [feature, investment, crud, planned]
created: 2026-06-27
updated: 2026-06-27
status: planned
sources: ["raw/90-crud-transactions/issue.md"]
related: ["features/investment-tracking", "plans/investment-tracking-v2-enhancements"]
---

# Feature: ETF Transactions CRUD & Settings Persistence

Status: planned
Priority: high

## Description

Add edit/delete capabilities for ETF transactions and full settings persistence for broker configuration.

## Requirements

- **Transaction Table Actions:** `Edit` / `Delete` icons in Holdings/Transactions table (MUI)
- **Safe Deletion Logic:** Cascading state recalculation:
  - Revert units from Invested Capital pool
  - Recalculate Average Cost Basis (PMC) dynamically
  - Restore corresponding capital to Broker Cash Balance
- **Settings Persistence:** Broker Settings modal allows full updates without wiping historical snapshots

## Related

- [[features/investment-tracking]]
- [[plans/investment-tracking-v2-enhancements]]
- GitHub: [#90](https://github.com/AlexDevsTheWeb/myfinance/issues/90)
- Source: [raw/90-crud-transactions/issue.md](raw/90-crud-transactions/issue.md)
