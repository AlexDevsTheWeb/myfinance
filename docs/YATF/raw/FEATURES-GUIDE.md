# Features Guide — Investment Tracking & Financial Projections

## 1. Investment Tracking (`/invest`)

Track a multi-broker ETF portfolio with cash management, buy/sell transactions, automated PAC, and market price refresh.

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
| **Type** | `Buy` (you purchased units) or `Sell` (you sold units) |
| **Units** | Supports fractional shares (e.g. `0.523`) |
| **Price (€)** | Per-unit price at time of transaction |
| **Total (€)** | Auto-calculated as `units × price`. You can override manually if needed |
| **Date** | Defaults to today |
| **Account** | Which finance account this is linked to |
| **Description** | Free text, e.g. *"Monthly buy Jan 2026"* |
| **Notes** | Optional longer notes |

After saving, the portfolio view updates instantly.

### Editing & Deleting Transactions

- **Edit**: Click the ✏️ icon in the Holdings Table to modify an existing transaction. The modal opens pre-filled with the transaction data. Change any field and save.
- **Delete**: Click the 🗑️ icon to remove a transaction. After confirmation, the system automatically recalculates your portfolio (reverts units, recalculates average cost, updates cash balance, and records a new portfolio snapshot).

### PAC Automation

When you configure a **Monthly PAC (€)** on a broker account, the system automatically detects when a new month starts and the configured PAC day (default: 1st of the month) has passed:

1. A **PAC Pending** badge appears in the Investment page header with a warning indicator
2. Click the badge to open the **PAC Confirmation Dialog**
3. Review the details (broker name, amount, date)
4. Choose:
   - **Confirm & Execute** — the system fetches the current market price and creates a `System-Generated Buy` transaction
   - **Dismiss** — skips this month's PAC (the badge disappears, next month will trigger again)

The system checks once per month per broker and never duplicates.

### Cash Adjustments & Dividends

In the **Cash Balance** tab you can record cash events that don't involve buying or selling ETF units:

**Cash Adjustment** (Cash Deposit / Withdrawal):
Track external cash flows to/from your broker — e.g. a bank transfer you made to top up your broker, or a withdrawal back to your bank. This adjusts the broker cash balance without creating ETF transactions.

To add one: click **Cash Adjustment** in the Cash Balance tab, select the broker, enter the amount (positive for deposits, negative for withdrawals), and the date.

**Dividend / Interest Entry**:
Record dividend payouts or interest credits from your broker. This increases the broker cash balance without affecting your ETF unit count. A green badge in the sidebar shows your total dividends for the current month.

To add one: click **Add Dividend** in the Cash Balance tab, select the broker, ticker, type (Dividend or Interest), amount, and date.

### Understanding the Dashboard

**Tab 1 — "Cash Balance"** (AccountBalance icon):
- **Cash Interest Card**: Shows broker name(s), cash balance (lump sum minus total invested, plus adjustments and dividends), monthly accrued interest, and APY. When a specific broker is selected, shows per-broker data.
- **Dividend Badge**: Green chip showing total dividends/interest received this month.
- **Cash Adjustment & Dividend Buttons**: Quick-action buttons to add cash deposits, withdrawals, or dividend entries.
- **Portfolio Value Chart**: Area chart showing portfolio value vs total invested over time. Use `1M` / `6M` / `1Y` / `ALL` buttons to change the time range.

**Tab 2 — "Invested Capital"** (TrendingUp icon):
- **Summary cards**: Total Invested, Current Value (highlighted), Total Return (€ and %).
- **Holdings Table**: Ticker, Units, Avg Cost, Current Price, Value, Return %, and Actions (edit/delete).
- **Allocation Donut Chart**: Visual breakdown by ticker.
- **Portfolio Line Chart**: Full-width chart below.
- **Tax Pocket**: Year-over-year capital gains tax card at the bottom. Shows realized gains and 26% Italian tax due per tax year when you sell ETF positions at a profit.

### Refreshing Prices

Click **Refresh Prices** in the page header to fetch the latest market prices for all held tickers via Yahoo Finance. The button shows *"Updating…"* while loading. Note that prices are delayed up to 15 minutes (standard Yahoo Finance limitation).

### Notes

- Supports **multiple broker accounts** — add as many as you need
- Transactions can be **edited and deleted** at any time with automatic portfolio recalculation
- **PAC automation** handles recurring monthly buys — no need to manually record each transaction
- Cash balance = lump sum − total invested + cash adjustments + dividends (per-broker or aggregated)
- **Cash adjustments** and **dividend entries** modify the cash balance without affecting ETF unit counts
- The **Tax Pocket** widget computes 26% Italian capital gains tax on realized gains per year
- Portfolio snapshots are persisted to Firestore for cross-device charting
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

### Inflation Adjustment

Toggle **"Adjust for Inflation (2%)"** to see how inflation affects your purchasing power over time:

- **When OFF** (default): The chart shows nominal (face-value) projections
- **When ON**: The main `Net Worth` line shows real (inflation-adjusted) value. A dashed red **Nominal Value** overlay line appears so you can compare both. A **Real Final Capital** card appears in the summary showing the inflation-adjusted final amount.

The inflation adjustment uses a 2% annual rate with per-month compounding for accuracy. Tax estimates remain on nominal gains (Italian 26% capital gains tax applies to nominal profits, not inflation-adjusted ones).

### Understanding the Simulation

The engine runs a **monthly loop** for the full horizon:

1. At the start of each year (from year 2), the annual inflow is added to cash
2. Cash earns interest at the configured cash rate (compounded monthly)
3. The PAC amount is transferred from cash to ETF (capped at available cash)
4. The ETF position grows at the configured return rate (compounded monthly)
5. If inflation adjustment is on, each month's values are divided by the cumulative inflation factor
6. All values are rounded to integers

### Reading the Chart

- **Indigo area** (solid line) — Net Worth: real value when inflation is on, nominal when off
- **Green area** (dashed line) — Total Invested (cumulative capital you put in)
- **Red dashed line** (only when inflation is on) — Nominal Value overlay showing what the same projection looks like without inflation
- Hover over the chart to see exact values at any year
- Y-axis shows € with k/M suffixes (e.g. €50k, €1.2M)

### Summary Cards

The cards below the chart show the **final year** metrics:

| Card | Color | What it shows |
|------|-------|---------------|
| **Final Capital** | Indigo | Total net worth at end of horizon |
| **Total Interests Earned** | Green | Net worth minus total invested = profit |
| **Estimated Taxes (26%)** | Red | 26% Italian capital gains tax on the profit |
| **Real Final Capital** | Red (when enabled) | Inflation-adjusted final capital, shown only when inflation toggle is on |

### Smart Prefill

If you have configured your broker settings in the Investment page, the Projections page automatically pulls in your PAC amount, lump sum, and cash interest rate as defaults. You can override them at any time — prefill only sets the initial values.

With multiple broker accounts, the prefill uses aggregated values.

### Use Real Performance

If you have been tracking investments with at least 2 portfolio snapshots, a **"Use Real Performance"** toggle appears below the ETF return slider. Flipping it on replaces the manual ETF return estimate with the **Compound Annual Growth Rate (CAGR)** computed from your actual portfolio history. The slider becomes read-only, showing your real CAGR value. Toggle it off to return to manual control.

### Example Scenarios

**Conservative:** 10 years, 4% ETF return, €10k lump sum, €200/mo PAC
**Moderate:** 20 years, 7% ETF return, €10k lump sum, €500/mo PAC, €5k/yr annual inflow
**Aggressive:** 30 years, 10% ETF return, €50k lump sum, €1000/mo PAC

### Notes

- All computation happens in your browser — no data is saved to Firestore or any server
- Projections are deterministic (same inputs always produce same output)
- Tax estimate is a flat 26% on capital gains (Italian regime). No deductions or allowances are modelled
- Inflation adjustment is off by default; toggle it on to see real purchasing power

---

## Data Flow Between Features

The two features integrate at two points:

```
Broker Settings  ──prefill──►  Projections Page
(lump sum, PAC,                 (initial defaults)
 interest rate)

Portfolio Snapshots ──CAGR──►  Projections Page
(historical value               ("Use Real Performance" toggle,
  time series)                   replaces manual ETF return)

Cash Adjustments &    ──store──►  Broker Cash Balance
Dividend Entries                  (modify cash without
                                  affecting ETF units)

ETF Transactions ──snapshot──►  Firestore Subcollection
(buy/sell records)              (persistent portfolio history)

ETF Sell          ──compute──►  Tax Pocket
transactions                     (26% capital gains per year)
```

Setting up your broker in Investments means you don't have to re-enter your numbers when testing projections. The prefill is read-only — changing values on the Projections page does not modify your broker settings.

If you have portfolio history, you can toggle **"Use Real Performance"** to base projections on your actual CAGR instead of a manual estimate.

Portfolio snapshots from your transactions are automatically persisted for cross-device charting.

Cash adjustments and dividend entries let you track external cash flows and investment income separately from ETF buy/sell activity.
