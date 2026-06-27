---
title: "Investment Tracking & Financial Projections — User Guide"
tags: [feature, investment, projections, guide]
created: 2026-06-27
updated: 2026-06-27
status: active
sources: ["raw/FEATURES-GUIDE.md"]
related: ["features/guida-investimenti", "features/investment-tracking", "features/financial-projections", "features/multi-broker-architecture", "features/crud-etf-transactions", "features/pac-automation", "features/historical-snapshots", "features/tax-inflation-modeling", "features/ticker-validation", "architecture/investment-tracking-architecture", "architecture/financial-projections-architecture"]
---

# User Guide: Investment Tracking & Financial Projections

## 1. Investment Tracking (`/invest`)

Track a **multi-broker** ETF portfolio with cash management, buy/sell transactions, **automated PAC**, and market price refresh.

### Getting Started

1. **Enable the module**: Go to **Settings** (`/config`) → *Active Modules* → toggle **Investment Tracking** on.
2. **Configure your broker(s)**: On the Investment page, click **Settings** to add one or more broker accounts. For each broker fill in:
   - **Broker Name** — e.g. *Trade Republic*, *Degiro*, *Fineco*
   - **Lump Sum (€)** — the total cash you initially deposited at the broker
   - **Monthly PAC (€)** — your recurring monthly investment amount (the system will prompt you to execute it each month)
   - **ETF Ticker** — your ETF ticker in Yahoo Finance format, e.g. `SWDA.MI` (Milan), `VWCE.DE` (Xetra). The system validates the ticker format when you save.
   - **Interest Rate (%)** — the annual interest your broker pays on uninvested cash (e.g. 2.0 for 2% APY)

You can add, edit, or delete broker accounts at any time via the same Settings modal.

### Filtering by Broker

Use the **Broker Select** dropdown in the page header to filter the dashboard:
- **All Brokers (Aggregated)** — view your total net worth across all accounts
- **Individual broker** — view per-broker cash balance, holdings, and returns

### Adding Transactions

Switch to the **Invested Capital** tab and click **Add Transaction**:

| Field | Notes |
|-------|-------|
| **Broker Account** | Select which broker this transaction belongs to |
| **Ticker** | Auto-filled from your broker config, editable |
| **Type** | `Buy` or `Sell` |
| **Units** | Supports fractional shares (e.g. `0.523`) |
| **Price (€)** | Per-unit price at time of transaction |
| **Total (€)** | Auto-calculated as `units × price`, manually overridable |
| **Date** | Defaults to today |
| **Account** | Which finance account this is linked to |
| **Description** | Free text, e.g. *"Monthly buy Jan 2026"* |
| **Notes** | Optional longer notes |

### Editing & Deleting Transactions

- **Edit**: Click the ✏️ icon in the Holdings Table to modify an existing transaction. The modal opens pre-filled. Change any field and save.
- **Delete**: Click the 🗑️ icon to remove a transaction. The system automatically recalculates your portfolio (reverts units, recalculates average cost, updates cash balance, records a new snapshot).

### PAC Automation

When you configure a **Monthly PAC (€)** on a broker account, the system automatically detects when a new month starts and the PAC day (default: 1st) has passed:

1. A **PAC Pending** badge appears in the page header
2. Click it to open the **PAC Confirmation Dialog** (broker name, amount, date)
3. Choose **Confirm & Execute** (fetches price, creates `System-Generated Buy`) or **Dismiss** (skips month)

The system checks once per month per broker — no duplicates.

### Dashboard Tabs

**Tab 1 — "Cash Balance"**: Cash interest card (broker name(s), cash balance, accrued interest, APY) + portfolio value area chart with time range buttons.

**Tab 2 — "Invested Capital"**: Summary cards, Holdings Table (with Edit/Delete actions), Allocation Donut Chart, Portfolio Line Chart.

### Refreshing Prices

Click **Refresh Prices** in the page header to fetch latest prices for all held tickers. Prices delayed up to 15 minutes (Yahoo Finance limitation).

### Notes

- Supports **multiple broker accounts**
- Transactions can be **edited and deleted** with automatic portfolio recalculation
- **PAC automation** handles recurring monthly buys
- Portfolio snapshots persisted to Firestore for **cross-device charting**
- Historic prices are not stored

---

## 2. Financial Projections (`/projections`)

Simulate long-term (1–50 year) investment growth with a compound interest model. Fully client-side.

### Input Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| **Investment Horizon** | 1–50 years | 20 | How many years to simulate |
| **ETF Annual Return** | 0–20% | 7% | Expected yearly return |
| **Cash Interest Rate** | 0–10% | 2% | Interest on uninvested cash |
| **Initial Lump-Sum (€)** | ≥ 0 | 0 | One-time starting investment |
| **Monthly PAC (€)** | ≥ 0 | 200 | Amount invested every month |
| **Annual Inflow (€)** | ≥ 0 | 0 | Yearly additional deposit (from year 2) |

### Inflation Adjustment

Toggle **"Adjust for Inflation (2%)"** to see real purchasing power:

- **OFF** (default): Nominal (face-value) projections
- **ON**: Main `Net Worth` line shows real (inflation-adjusted) value. A dashed red **Nominal Value** overlay appears. A **Real Final Capital** card appears in summary.

Uses 2% annual rate with per-month compounding. Tax estimates remain on nominal gains.

### Simulation Engine

Runs a **monthly loop** for the full horizon:
1. Annual inflow added to cash (from year 2)
2. Cash earns interest (compounded monthly)
3. PAC transferred from cash to ETF (capped at available cash)
4. ETF grows at configured return rate (compounded monthly)
5. If inflation is on, values divided by cumulative inflation factor
6. All values rounded to integers

### Chart

- **Indigo area** — Net Worth: real when inflation on, nominal when off
- **Green dashed line** — Total Invested
- **Red dashed line** (inflation on) — Nominal Value overlay
- Hover for exact values; Y-axis uses k/M suffixes

### Summary Cards

| Card | What it shows |
|------|---------------|
| **Final Capital** | Total net worth at end of horizon |
| **Total Interests Earned** | Net worth minus total invested = profit |
| **Estimated Taxes (26%)** | 26% Italian capital gains tax on profit |
| **Real Final Capital** | Inflation-adjusted final capital (shown when inflation toggle is on) |

### Smart Prefill

If broker settings are configured in Investments, the Projections page auto-fills PAC amount, lump sum, and interest rate as defaults. With multiple broker accounts, uses aggregated values.

### Notes

- All computation is client-side (no Firestore writes)
- Deterministic — same inputs always produce same output
- Tax is flat 26% on capital gains (Italian regime)
- Inflation adjustment is off by default; toggle it on for real purchasing power

## Data Flow Between Features

```
Broker Settings  ──prefill──►  Projections Page
(lump sum, PAC,                 (initial defaults)
 interest rate)

ETF Transactions ──snapshot──►  Firestore Subcollection
(buy/sell records)              (persistent portfolio history)
```

Setting up your broker means you don't have to re-enter numbers on the Projections page. Portfolio snapshots from transactions are automatically persisted for cross-device charting.

---

**Italian version:** [[features/guida-investimenti]]

## Related

- [[features/investment-tracking]]
- [[features/financial-projections]]
- [[features/multi-broker-architecture]]
- [[features/crud-etf-transactions]]
- [[features/pac-automation]]
- [[features/historical-snapshots]]
- [[features/tax-inflation-modeling]]
- [[features/ticker-validation]]
- [[architecture/investment-tracking-architecture]]
- [[architecture/financial-projections-architecture]]
- Source: [raw/FEATURES-GUIDE.md](raw/FEATURES-GUIDE.md)
