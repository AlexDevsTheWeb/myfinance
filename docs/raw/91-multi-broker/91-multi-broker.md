# [FEATURE] [FEATURE] Investment Tracking — Multi-Broker & Multi-Asset Architecture

> Source: GitHub Issue [#91](https://github.com/AlexDevsTheWeb/myfinance/issues/91)
> State: OPEN
> Labels: feature
> Created: 2026-06-27

## Objective
Refactor the current single-broker, single-ETF schema to support multiple broker accounts and multiple assets.

## Current Limitation
The database schema and store logic are hardcoded for a single broker and a single ETF ticker, preventing portfolio diversification.

## Requirements
- **Database Schema Refactor:** Transform single-object config into collections:

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

- **Account Filtering:** `<Select />` dropdown to filter dashboard by broker or view \"All Brokers (Aggregated)\" net worth.
- **Dynamic Distribution:** Donut chart scales from single-asset to multi-ETF percentage breakdown.
- **TypeScript Types:** Refactor from single object to `BrokerAccount[]` and `AssetHolding[]`.

## Related
- Source: [raw/ux-improvments/ux-improvments.md](raw/ux-improvments/ux-improvments.md)
