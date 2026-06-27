---
title: "Investment Tracking & Financial Projections — User Guide"
tags: [feature, investment, projections, guide]
created: 2026-06-27
updated: 2026-06-27
status: active
sources: ["raw/FEATURES-GUIDE.md"]
related: ["features/guida-investimenti", "features/investment-tracking", "features/financial-projections", "architecture/investment-tracking-architecture", "architecture/financial-projections-architecture"]
---

# User Guide: Investment Tracking & Financial Projections

## 1. Investment Tracking (`/invest`)

Track a single-ETF portfolio with broker cash management, buy/sell transactions, and market price refresh.

### Getting Started

1. **Enable the module**: Go to **Settings** (`/config`) → *Active Modules* → toggle **Investment Tracking** on.
2. **Configure your broker**: On the Investment page, click **Settings** and fill in:
   - **Broker Name** — e.g. *Trade Republic*, *Degiro*
   - **Lump Sum (€)** — the total cash you initially deposited at the broker
   - **Monthly PAC (€)** — your recurring monthly investment amount
   - **ETF Ticker** — your ETF ticker in Yahoo Finance format, e.g. `SWDA.MI`, `VWCE.DE`
   - **Interest Rate (%)** — the annual interest your broker pays on uninvested cash

### Adding Transactions

Switch to the **Invested Capital** tab and click **Add Transaction**:

| Field | Notes |
|-------|-------|
| **Ticker** | Auto-filled from your broker config, editable |
| **Type** | `Buy` or `Sell` |
| **Units** | Supports fractional shares (e.g. `0.523`) |
| **Price (€)** | Per-unit price at time of transaction |
| **Total (€)** | Auto-calculated as `units × price`, manually overridable |
| **Date** | Defaults to today |
| **Account** | Which finance account this is linked to |
| **Description** | Free text, e.g. *"Monthly buy Jan 2026"* |
| **Notes** | Optional longer notes |

### Dashboard Tabs

**Tab 1 — "Cash Balance"**: Cash interest card (broker name, cash balance, accrued interest, APY) + portfolio value area chart with `1M` / `6M` / `1Y` / `ALL` time range buttons.

**Tab 2 — "Invested Capital"**: Summary cards (Total Invested, Current Value, Total Return), Holdings Table (ticker, units, avg cost, current price, value, return %), Allocation Donut Chart, Portfolio Line Chart.

### Refreshing Prices

Click **Refresh Prices** in the page header. Prices are delayed up to 15 minutes (Yahoo Finance limitation).

### Notes & Limitations

- Designed for **single broker / single ETF**
- No transaction edit or delete UI yet (Firestore console required)
- PAC amount is for reference only — no automation
- Cash balance = lump sum − total invested
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

### Simulation Engine

Runs a **monthly loop** for the full horizon:
1. Annual inflow added to cash (from year 2)
2. Cash earns interest (compounded monthly)
3. PAC transferred from cash to ETF (capped at available cash)
4. ETF grows at configured return rate (compounded monthly)
5. All values rounded to integers

### Chart

- **Indigo area** — Projected Net Worth (cash + ETF value)
- **Green dashed line** — Total Invested
- Hover for exact year values; Y-axis uses k/M suffixes

### Summary Cards

| Card | What it shows |
|------|---------------|
| **Final Capital** | Total net worth at end of horizon |
| **Total Interests Earned** | Net worth minus total invested = profit |
| **Estimated Taxes (26%)** | 26% Italian capital gains tax on profit |

### Smart Prefill

If broker settings are configured in Investments, the Projections page auto-fills PAC amount, lump sum, and interest rate as defaults. Overridable at any time.

### Notes

- All computation is client-side (no Firestore writes)
- Deterministic — same inputs always produce same output
- Tax is flat 26% on capital gains (Italian regime)
- Inflation not factored in — returns are nominal

## Data Flow Between Features

```
Broker Settings ──prefill──► Projections Page
(lump sum, PAC,              (initial defaults)
 interest rate)
```

Setting up your broker means you don't have to re-enter numbers on the Projections page. Prefill is read-only — changing values on Projections does not modify broker settings.

---

**Italian version:** [[features/guida-investimenti]]

## Related

- [[features/investment-tracking]]
- [[features/financial-projections]]
- [[architecture/investment-tracking-architecture]]
- [[architecture/financial-projections-architecture]]
- Source: [raw/FEATURES-GUIDE.md](raw/FEATURES-GUIDE.md)
