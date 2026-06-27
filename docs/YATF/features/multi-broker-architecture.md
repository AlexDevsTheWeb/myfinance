---
title: "Multi-Broker & Multi-Asset Architecture"
tags: [feature, investment, architecture, planned]
created: 2026-06-27
updated: 2026-06-27
status: planned
sources: ["raw/91-multi-broker/issue.md"]
related: ["features/investment-tracking", "architecture/investment-tracking-architecture", "plans/investment-tracking-v2-enhancements"]
---

# Feature: Multi-Broker & Multi-Asset Architecture

Status: planned
Priority: high

## Description

Refactor the current single-broker, single-ETF schema to support multiple broker accounts and multiple assets (portfolio diversification).

## Requirements

- **Database Schema Refactor:** Transform from single-object config to collections:

  ```typescript
  interface BrokerAccount {
    id: string;
    name: string;
    baseLumpSum: number;
    interestRate: number;
  }

  interface AssetHolding {
    ticker: string;
    brokerId: string;
    units: number;
  }
  ```

- **Account Filtering:** `<Select />` dropdown to filter dashboard by broker or "All Brokers (Aggregated)" net worth
- **Dynamic Distribution:** Donut chart scales from single-asset to multi-ETF percentage breakdown
- **TypeScript Types:** Refactor from single object to `BrokerAccount[]` and `AssetHolding[]`

## Implementation Notes

This is the foundational change that the other V2 features depend on. The schema refactor must be planned carefully to avoid breaking existing user data.

## Related

- [[features/investment-tracking]]
- [[architecture/investment-tracking-architecture]]
- [[plans/investment-tracking-v2-enhancements]]
- GitHub: [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91)
- Source: [raw/91-multi-broker/issue.md](raw/91-multi-broker/issue.md)
