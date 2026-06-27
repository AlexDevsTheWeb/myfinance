# Features Guide — Investment Tracking & Financial Projections

## 1. Investment Tracking (`/invest`)

Track a single-ETF portfolio with broker cash management, buy/sell transactions, and market price refresh.

### Getting Started

1. **Enable the module**: Go to **Settings** (`/config`) → *Active Modules* → toggle **Investment Tracking** on.
2. **Configure your broker**: On the Investment page, click **Settings** and fill in:
   - **Broker Name** — e.g. *Trade Republic*, *Degiro*
   - **Lump Sum (€)** — the total cash you initially deposited at the broker
   - **Monthly PAC (€)** — your recurring monthly investment amount (for reference, not yet automated)
   - **ETF Ticker** — your ETF ticker in Yahoo Finance format, e.g. `SWDA.MI` (Milan), `VWCE.DE` (Xetra)
   - **Interest Rate (%)** — the annual interest your broker pays on uninvested cash (e.g. 2.0 for 2% APY)

### Adding Transactions

Switch to the **Invested Capital** tab and click **Add Transaction**:

| Field | Notes |
|-------|-------|
| **Ticker** | Auto-filled from your broker config, editable |
| **Type** | `Buy` (you purchased units) or `Sell` (you sold units) |
| **Units** | Supports fractional shares (e.g. `0.523`) |
| **Price (€)** | Per-unit price at time of transaction |
| **Total (€)** | Auto-calculated as `units × price`. You can override manually if needed |
| **Date** | Defaults to today |
| **Account** | Which finance account this is linked to |
| **Description** | Free text, e.g. *"Monthly buy Jan 2026"* |
| **Notes** | Optional longer notes |

After saving, the portfolio view updates instantly.

### Understanding the Dashboard

**Tab 1 — "Cash Balance"** (AccountBalance icon):
- **Cash Interest Card**: Shows your broker name, cash balance (lump sum minus total invested), monthly accrued interest, and APY.
- **Portfolio Value Chart**: Area chart showing portfolio value vs total invested over time. Use `1M` / `6M` / `1Y` / `ALL` buttons to change the time range.

**Tab 2 — "Invested Capital"** (TrendingUp icon):
- **Summary cards**: Total Invested, Current Value (highlighted), Total Return (€ and %).
- **Holdings Table**: Ticker, Units, Avg Cost, Current Price, Value, Return %. Returns color-coded green/red.
- **Allocation Donut Chart**: Visual breakdown by ticker.
- **Portfolio Line Chart**: Full-width chart below.

### Refreshing Prices

Click **Refresh Prices** in the page header to fetch the latest market price via Yahoo Finance. The button shows *"Updating…"* while loading. Note that prices are delayed up to 15 minutes (standard Yahoo Finance limitation).

### Notes & Limitations

- Designed for a **single broker / single ETF** setup
- There is no transaction edit or delete UI yet (requires Firestore console for removal)
- The **PAC (Monthly Investment Plan)** amount is stored for reference but does not drive any automation — you must manually record each buy transaction
- Cash balance = lump sum − total invested across all buy transactions
- Historic prices are not stored; the chart uses the value at the time each snapshot was recorded

---

## 2. Financial Projections (`/projections`)

Simulate long-term (1–50 year) investment growth with a compound interest model. Fully client-side — no data is saved or sent anywhere.

### How to Use

Navigate to **Projections** via the top navigation bar (or `/projections`). Adjust any parameter and the chart updates in real time.

### Input Parameters

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| **Investment Horizon** | Slider | 1–50 years | 20 | How many years to simulate |
| **ETF Annual Return** | Slider | 0–20% | 7% | Expected yearly return of your ETF |
| **Cash Interest Rate** | Slider | 0–10% | 2% | Interest earned on uninvested cash |
| **Initial Lump-Sum (€)** | Text | ≥ 0 | 0 | One-time starting investment |
| **Monthly PAC (€)** | Text | ≥ 0 | 200 | Amount invested every month |
| **Annual Inflow (€)** | Text | ≥ 0 | 0 | Yearly additional deposit (from year 2) |

### Understanding the Simulation

The engine runs a **monthly loop** for the full horizon:

1. At the start of each year (from year 2), the annual inflow is added to cash
2. Cash earns interest at the configured cash rate (compounded monthly)
3. The PAC amount is transferred from cash to ETF (capped at available cash)
4. The ETF position grows at the configured return rate (compounded monthly)
5. All values are rounded to integers

### Reading the Chart

- **Indigo area** (solid line) — Projected Net Worth (cash + ETF value)
- **Green area** (dashed line) — Total Invested (cumulative capital you put in)
- Hover over the chart to see exact values at any year
- Y-axis shows € with k/M suffixes (e.g. €50k, €1.2M)

### Summary Cards

The three cards below the chart show the **final year** metrics:

| Card | Color | What it shows |
|------|-------|---------------|
| **Final Capital** | Indigo | Total net worth at end of horizon |
| **Total Interests Earned** | Green | Net worth minus total invested = profit |
| **Estimated Taxes (26%)** | Red | 26% Italian capital gains tax on the profit |

### Smart Prefill

If you have configured your broker settings in the Investment page, the Projections page automatically pulls in your PAC amount, lump sum, and cash interest rate as defaults. You can override them at any time — prefill only sets the initial values.

### Example Scenarios

**Conservative:** 10 years, 4% ETF return, €10k lump sum, €200/mo PAC
**Moderate:** 20 years, 7% ETF return, €10k lump sum, €500/mo PAC, €5k/yr annual inflow
**Aggressive:** 30 years, 10% ETF return, €50k lump sum, €1000/mo PAC

### Notes

- All computation happens in your browser — no data is saved to Firestore or any server
- Projections are deterministic (same inputs always produce same output)
- Tax estimate is a flat 26% on capital gains (Italian regime). No deductions or allowances are modelled
- Inflation is not factored in — returns are nominal

---

## Data Flow Between Features

The two features integrate at one point:

```
Broker Settings  ──prefill──►  Projections Page
(lump sum, PAC,                 (initial defaults)
 interest rate)
```

Setting up your broker in Investments means you don't have to re-enter your numbers when testing projections. The prefill is read-only — changing values on the Projections page does not modify your broker settings.
