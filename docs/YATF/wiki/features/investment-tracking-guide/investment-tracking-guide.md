---
title: "Investment Tracking & Projections — Feature Guide & Code Analysis"
tags: [feature, investment, projections, guide, code-analysis]
created: 2026-07-03
updated: 2026-07-03
status: active
sources: ["raw/FEATURES-GUIDE/FEATURES-GUIDE.md", "raw/98-investment-tracking-v3/98-investment-tracking-v3.md", "raw/83-financial-projections/83-financial-projections.md"]
related: ["features/investment-tracking", "features/financial-projections", "features/investment-tracking-v3", "architecture/investment-tracking-architecture", "architecture/financial-projections-architecture", "features/multi-broker-architecture", "features/pac-automation", "features/crud-etf-transactions", "features/historical-snapshots", "features/tax-inflation-modeling"]
---

# Investment Tracking (`/invest`) & Financial Projections (`/projections`) — Complete Guide & Code Analysis

---

## PART 1: USER GUIDE (`/invest`)

### Overview

Track a multi-broker ETF portfolio with cash management, buy/sell transactions, automated PAC, dividend/interest tracking, cash adjustments, and market price refresh.

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

- **Edit**: Click the ✏️ icon in the Holdings Table to modify an existing transaction. The modal opens pre-filled with the transaction data.
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
Track external cash flows to/from your broker — e.g. a bank transfer you made to top up your broker, or a withdrawal back to your bank. This adjusts the broker cash balance without creating ETF transactions. Click **Cash Adjustment** in the Cash Balance tab, select the broker, enter the amount (positive for deposits, negative for withdrawals), and the date.

**Dividend / Interest Entry**:
Record dividend payouts or interest credits from your broker. This increases the broker cash balance without affecting your ETF unit count. A green badge in the sidebar shows your total dividends for the current month. Click **Add Dividend** in the Cash Balance tab, select the broker, ticker, type (Dividend or Interest), amount, and date.

### Understanding the Dashboard

**Tab 1 — "Cash Balance"** (AccountBalance icon):
- **CashInterestCard**: Shows broker name(s), cash balance (lump sum minus total invested, plus adjustments and dividends), monthly accrued interest, and APY. When a specific broker is selected, shows per-broker data.
- **DividendBadge**: Green chip showing total dividends/interest received this month.
- **Cash Adjustment & Dividend Buttons**: Quick-action buttons to add cash deposits, withdrawals, or dividend entries.
- **PortfolioLineChart**: Area chart showing portfolio value vs total invested over time. Use `1M` / `6M` / `1Y` / `ALL` buttons to change the time range.

**Tab 2 — "Invested Capital"** (TrendingUp icon):
- **PortfolioStats**: Total Invested, Current Value (highlighted), Total Return (€ and %).
- **HoldingsTable**: Ticker, Units, Avg Cost, Current Price, Value, Return %, and Actions (edit/delete).
- **AllocationDonutChart**: Visual breakdown by ticker.
- **PortfolioLineChart**: Full-width chart below.
- **TaxPocketWidget**: Year-over-year capital gains tax card. Shows realized gains and 26% Italian tax due per tax year when you sell ETF positions at a profit.

### Refreshing Prices

Click **Refresh Prices** in the page header to fetch the latest market prices for all held tickers via Yahoo Finance. The button shows *"Updating…"* while loading. Prices are delayed up to 15 minutes (standard Yahoo Finance limitation).

### Key Notes

- Supports **multiple broker accounts** — add as many as you need
- Transactions can be **edited and deleted** at any time with automatic portfolio recalculation
- **PAC automation** handles recurring monthly buys
- Cash balance = lump sum − total invested + cash adjustments + dividends (per-broker or aggregated)
- **Cash adjustments** and **dividend entries** modify the cash balance without affecting ETF unit counts
- The **TaxPocketWidget** computes 26% Italian capital gains tax on realized gains per year
- Portfolio snapshots are persisted to Firestore for cross-device charting
- Historic prices are not stored; the chart uses the value at the time each snapshot was recorded

---

## PART 2: USER GUIDE (`/projections`)

### Overview

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
- **When ON**: The main `Net Worth` line shows real (inflation-adjusted) value. A dashed red **Nominal Value** overlay line appears. A **Real Final Capital** card appears in the summary.

The inflation adjustment uses a 2% annual rate with per-month compounding for accuracy. Tax estimates remain on nominal gains (Italian 26% capital gains tax applies to nominal profits).

### Simulation Engine

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
- **Red dashed line** (only when inflation is on) — Nominal Value overlay
- Hover over the chart to see exact values at any year
- Y-axis shows € with k/M suffixes (e.g. €50k, €1.2M)

### Summary Cards

| Card | Color | What it shows |
|------|-------|---------------|
| **Final Capital** | Indigo | Total net worth at end of horizon |
| **Total Interests Earned** | Green | Net worth minus total invested = profit |
| **Estimated Taxes (26%)** | Red | 26% Italian capital gains tax on the profit |
| **Real Final Capital** | Red (when enabled) | Inflation-adjusted final capital |

### Smart Prefill

If you have configured your broker settings in the Investment page, the Projections page automatically pulls in your PAC amount, lump sum, and cash interest rate as defaults. You can override them at any time.

### Use Real Performance

If you have been tracking investments with at least 2 portfolio snapshots, a **"Use Real Performance"** toggle appears below the ETF return slider. Flipping it on replaces the manual ETF return estimate with the **Compound Annual Growth Rate (CAGR)** computed from your actual portfolio history. The slider becomes read-only, showing your real CAGR value.

### Example Scenarios

**Conservative:** 10 years, 4% ETF return, €10k lump sum, €200/mo PAC
**Moderate:** 20 years, 7% ETF return, €10k lump sum, €500/mo PAC, €5k/yr annual inflow
**Aggressive:** 30 years, 10% ETF return, €50k lump sum, €1000/mo PAC

### Notes

- All computation is client-side — no data is saved to Firestore
- Deterministic (same inputs always produce same output)
- Tax estimate is a flat 26% on capital gains (Italian regime)
- Inflation adjustment is off by default

### Data Flow Between Features

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

---

## PART 3: CODE ANALYSIS — `/invest`

### Page Structure (`src/pages/InvestmentPage.tsx`)

```
InvestmentPage
├── Header: Title + BrokerSelect + PAC Badge + Refresh + Settings buttons
├── Tabs: Cash Balance | Invested Capital
│
├── Tab 0 "Cash Balance"
│   ├── CashInterestCard (broker name, cash balance, interest)
│   ├── Cash Adjustment button → CashAdjustmentDialog
│   ├── Add Dividend button → DividendDialog
│   ├── DividendBadge (monthly dividends sum)
│   └── PortfolioLineChart (value over time)
│
├── Tab 1 "Invested Capital"
│   ├── PortfolioStats (3 metric cards)
│   ├── HoldingsTable (per-ticker breakdown, edit/delete)
│   ├── AllocationDonutChart (pie)
│   ├── PortfolioLineChart (full-width)
│   └── TaxPocketWidget (capital gains per year)
│
├── EtfTransactionModal (add/edit buy/sell)
├── BrokerSettingsModal (CRUD broker accounts)
├── PacConfirmationDialog (confirm/dismiss PAC)
├── CashAdjustmentDialog (external cash flows)
└── DividendDialog (dividend/interest entry)
```

### Key Hooks

#### `usePortfolio()` — `src/analytics/hooks/usePortfolio.ts`

This is the **core computation engine** for the Investment page. It's a `useMemo` hook that derives all portfolio metrics from raw store data.

**What it computes:**

| Output | Derivation |
|--------|-----------|
| `totalInvested` | Sum of all `buy` totals − sum of all `sell` totals, filtered by selected broker |
| `currentValue` | `totalUnits × currentPrice` (or latest snapshot value if no price) |
| `totalReturn` | `currentValue − totalInvested` |
| `totalReturnPercent` | `(totalReturn / totalInvested) × 100` |
| `cashBalance` | `totalBaseLumpSum − totalInvested + totalCashAdjustments + totalDividends`, floored at 0 |
| `interestRate` | Simple average of active brokers' interest rates |
| `accruedInterest` | `cashBalance × (weightedRate / 100) / 12` (monthly) |
| `chartData` | Sorted `portfolioSnapshots` mapped to `{date, value, invested}` |
| `holdings` | Per-ticker aggregation: units, avgCost, currentPrice, value, returnPercent |
| `monthlyDividends` | Sum of dividends in current month for active brokers |

**Key logic — sell transactions (avg cost method):**
```typescript
// When a sell happens:
const sellRatio = tx.units / h.units;  // proportion of holdings sold
h.totalCost = h.totalCost * (1 - sellRatio);  // reduce cost basis proportionally
```
This implements the **average cost basis** method — selling reduces the total cost basis by the same proportion as units sold.

**Cash balance formula:**
```typescript
cashBalance = totalBaseLumpSum - totalInvested + totalCashAdjustments + totalDividends
```
This means: you start with your lump sum, subtract what you've invested (buy transactions), add back what you've withdrawn (sell proceeds are reflected in `totalInvested` going down), and add external cash adjustments and dividends.

#### `usePacAutomation()` — `src/hooks/usePacAutomation.ts`

Runs once on mount (guarded by `useRef` to prevent HMR double-fire). Checks each broker:
1. Has `monthlyPacAmount > 0`?
2. No pending PAC already exists?
3. PAC not already generated this month (checks `localStorage` + `lastPacGenerationDate`)?
4. Current day ≥ PAC day (default: 1st)?

If all pass, calls `addPendingPacTransaction()` which sets `pendingPacTransaction` in the store, which triggers the badge in the header.

#### `useMarketData()` — `src/hooks/useMarketData.ts`

On "Refresh Prices" click:
1. Collects unique tickers from `assetHoldings`
2. Calls `https://api.yfin.dev/v1/quote?symbols={TICKERS}` (batch)
3. Sets first quote's `regularMarketPrice` as `currentPrice` in the store

**Limitation:** Only stores a single price (`currentPrice: number | null`). If you hold multiple tickers, all currently get priced at the same value. This is a known limitation — the price is applied uniformly to all holdings.

### Store Architecture (`src/store/useInvestmentStore.ts`)

**State shape:**
```typescript
interface InvestmentState {
  etfTransactions: IETFTransaction[];     // buy/sell records
  portfolioSnapshots: IPortfolioSnapshot[]; // value snapshots
  brokerAccounts: BrokerAccount[];         // multi-broker config
  assetHoldings: AssetHolding[];           // ticker→broker mapping
  selectedBrokerId: string | 'all';        // filter
  cashAdjustments: CashAdjustment[];       // external cash flows
  dividendEntries: DividendEntry[];        // dividend/interest records
  pendingPacTransaction: {...} | null;     // pending PAC state
  currentPrice: number | null;            // last fetched price
}
```

**Write pattern (optimistic → Firestore → rollback on error):**
```
validate() → optimistic set() → updateDoc() → on error: revert
```

**Snapshot cascade:** Every `addEtfTransaction` / `deleteEtfTransaction` automatically:
1. Computes a new `IPortfolioSnapshot` via `computeSnapshot()`
2. Appends to `portfolioSnapshots[]`
3. Writes to Firestore `users/{uid}.portfolioSnapshots`
4. Fire-and-forgets a subcollection write via `recordPortfolioSnapshot()`

### Tax Tracking (`src/analytics/hooks/useTaxTracking.ts`)

The `useTaxTracking` hook computes Italian 26% capital gains tax:

```typescript
// For each sell transaction:
const sellRatio = h.units > 0 ? tx.units / h.units : 0;
const costBasisRemoved = h.totalCost * sellRatio;
const realizedGain = tx.totalAmount - costBasisRemoved;
taxDue = realizedGain * 0.26;
```

It sorts all transactions chronologically, builds a running cost basis per-ticker (same avg cost method as `usePortfolio`), and for each sell, computes the realized gain as `sell proceeds − proportion of cost basis sold`. Only positive gains are taxed (no loss harvesting modeled).

Results are grouped by year and displayed in the `TaxPocketWidget`.

### How to Set Up `/invest` Correctly

1. **Broker Settings → Lump Sum**: Enter the TOTAL cash you've ever deposited at this broker. This is the baseline. If you deposited €10,000 initially and later added €2,000, set lump sum to €12,000.

2. **Cash Balance Interpretation**: The cash balance = lump sum − what you've spent on buys + cash adjustments + dividends. A negative cash balance is clamped to 0 (you can't have negative cash at a broker). If your cash balance is 0 but you still have cash at the broker, you need to either increase your lump sum or add a cash adjustment (deposit).

3. **PAC Automation**: Set `monthlyPacAmount` on each broker. The system checks on page load whether this month's PAC should trigger. It uses `localStorage` to track per-broker → prevents re-triggers on page refresh within the same month.

4. **Dividends & Interest**: These increase cash balance without affecting units. Good for tracking: coupon payments, dividend distributions, cashback.

5. **Cash Adjustments**: Use for external cash movements (deposits/withdrawals). Positive = money in, negative = money out. These are separate from the initial lump sum.

6. **Multi-Broker**: When viewing "All Brokers", the system aggregates everything. When viewing a single broker, only that broker's transactions/accounts affect the numbers.

7. **Refresh Prices**: After buying/selling, refresh prices to update current value. Without a price refresh, the system falls back to the latest snapshot's implied unit price.

---

## PART 4: CODE ANALYSIS — `/projections`

### Page Structure (`src/pages/ProjectionsPage.tsx`)

```
ProjectionsPage
├── Header: Title + Subtitle
├── Grid (controls 4-col | chart 8-col)
│   ├── ProjectionControls (sliders + text fields + toggles)
│   └── ProjectionChart (Recharts AreaChart)
└── ProjectionSummary (4 metric cards)
```

### Key Hook: `useProjections()` — `src/hooks/useProjections.ts`

**State management:** Uses `useState` + `useMemo` (not a global store — feature is single-page ephemeral).

**Flow:**
1. On mount: `prefetch()` reads `useInvestmentStore` for broker config (lump sum, PAC, interest rate) → sets initial values. Also computes `realCagr` from portfolio snapshots.
2. User adjusts any param via `setParam()` → triggers recalculation.
3. `effectiveInput` applies real CAGR if `useRealPerformance` is toggled.
4. `snapshots` = result of `generateFinancialProjection(effectiveInput)`.
5. If inflation is on, `nominalSnapshots` are also computed (without inflation) for overlay.
6. `chartData` = yearly aggregation for Recharts.
7. `summary` = last snapshot's `netWorth`, `netWorth − totalInvested`, and `(netWorth − totalInvested) × 0.26`.

### Simulation Engine: `generateFinancialProjection()` — `src/lib/compoundInterestUtils.ts`

**Pure function** with no side effects.

```
Input → monthly loop (years × 12 iterations) → MonthlySnapshot[]
```

**Monthly loop logic:**
```typescript
// 1. Annual inflow (year 2+)
if (monthOfCurrentYear === 1) {
  currentBrokerCash += annualInflow;
}

// 2. Cash interest (compounded monthly)
currentBrokerCash += currentBrokerCash * monthlyCashRate;

// 3. PAC transfer (capped)
const actualPacAmount = Math.min(monthlyPac, currentBrokerCash);
currentBrokerCash -= actualPacAmount;
currentEtfValue += actualPacAmount;

// 4. ETF return (compounded monthly)
currentEtfValue = currentEtfValue * (1 + monthlyEtfRate);
```

**Monthly rate conversion:** Annual rates are converted using the geometric formula:
```typescript
monthlyRate = (1 + annualRate) ^ (1/12) - 1
```
This is more accurate than dividing by 12 (accounts for compounding).

**Inflation adjustment** (applied post-loop):
```typescript
inflationFactor = (1 + monthlyInflation) ^ monthIndex;
snapshot.netWorth /= inflationFactor;  // discount each month
```
Uses per-month compounding rather than a simple annual divisor.

### CAGR Computation: `computeCAGR()` — `src/lib/compoundInterestUtils.ts`

```typescript
const first = sorted[0];
const last = sorted[sorted.length - 1];
const years = dayjs(last.date).diff(dayjs(first.date), 'year', true);
const cagr = Math.pow(endValue / startValue, 1 / years) - 1;
return Math.max(0, Math.min(0.20, cagr));  // Clamp 0%–20%
```
- Requires at least 2 snapshots with `totalInvested > 0`
- Uses `endValue = last.currentValue + last.cashBalance` (net worth)
- Clamped to [0%, 20%] to prevent unrealistic projections

### How to Set Up `/projections` Correctly

1. **Smart Prefill**: If you have broker accounts configured in `/invest`, the projections page auto-fills lump sum, PAC, and cash interest rate. If you don't, defaults are 0, €200, 2%.

2. **Use Real Performance**: Only appears if you have ≥2 portfolio snapshots with meaningful data. Computing CAGR requires a time span. If you just started tracking, make a few transactions first.

3. **Inflation Toggle**: Default OFF. When ON, the main chart line shows purchasing-power-adjusted value. The red dashed line shows the nominal equivalent. Summary adds a "Real Final Capital" card.

4. **Tax Estimate**: Flat 26% on projected profit. This is a rough estimate — real tax depends on actual realized gains, loss harvesting, and specific tax regime.

5. **Parameters are independent**: Changing ETF return doesn't affect cash interest rate. The simulation treats them as separate pools that interact only through the PAC transfer (cash → ETF).

6. **All client-side**: Nothing is persisted. Refreshing the page resets to defaults (or re-prefills from broker config).

---

## PART 5: DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────┐
│                    Firestore (users/{uid})               │
│  etfTransactions[]  portfolioSnapshots[]  brokerAccounts[]│
│  cashAdjustments[]  dividendEntries[]                     │
└──────────┬────────────────────────────────────┬──────────┘
           │ onSnapshot                         │ onSnapshot
           ▼                                    ▼
┌──────────────────────┐           ┌────────────────────────┐
│  useInvestmentStore   │           │  useInvestmentSync     │
│  (Zustand — writes)   │◄──────────│  (Firestore sync)      │
│  optimistic→Firestore │           │                        │
└──────┬──────────┬─────┘           └────────────────────────┘
       │          │
       ▼          ▼
┌────────────┐  ┌────────────────────────┐
│ usePortfolio│  │ usePacAutomation       │
│ (computed)  │  │ useMarketData          │
│             │  │ useTaxTracking         │
└──────┬─────┘  └────────────────────────┘
       │
       ▼
┌────────────────┐     ┌───────────────────────┐
│ /invest page   │     │ /projections page      │
│ components     │     │ useProjections() hook  │
│ (re-render)    │     │   ↓                    │
│                │     │ generateFinancial-     │
│                │     │ Projection() pure fn   │
│                │     │   ↓                    │
│                │     │ Recharts chart + cards │
└────────────────┘     └───────────────────────┘

Integration bridges:
  brokerAccounts ──prefill──→ useProjections (initial defaults)
  portfolioSnapshots ──CAGR──→ useProjections (real performance toggle)
```

---

## PART 6: KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `src/pages/InvestmentPage.tsx` | `/invest` route — orchestrates all investment components |
| `src/pages/ProjectionsPage.tsx` | `/projections` route — orchestrates projections UI |
| `src/analytics/hooks/usePortfolio.ts` | **Core computation** — derives all portfolio metrics from raw store data |
| `src/analytics/hooks/useTaxTracking.ts` | Capital gains tax computation (26% Italian) |
| `src/hooks/useProjections.ts` | State + computation hook for projections, prefill, CAGR |
| `src/hooks/usePacAutomation.ts` | Monthly PAC trigger detection |
| `src/hooks/useMarketData.ts` | Yahoo Finance price fetch |
| `src/store/useInvestmentStore.ts` | Zustand store — CRUD, optimistic updates, Firestore sync |
| `src/store/types/investment.types.ts` | All investment type definitions |
| `src/store/types/projection.types.ts` | Projection type definitions |
| `src/lib/compoundInterestUtils.ts` | Pure simulation engine + CAGR computation |
| `src/components/investment/*.tsx` | 14 UI components for the investment page |
| `src/components/projections/*.tsx` | 4 UI components for the projections page |
