# Daily Historical Portfolio Chart — Speculative Design

## Problem

The current portfolio chart shows data points from `portfolioSnapshots`, each created when a transaction is added or when "Refresh Prices" is clicked. While snapshot values are now computed with per-ticker market prices, the chart is still point-based rather than a continuous daily time series.

The chart should show:
- **Ticker price trend**: how the selected ETF's price evolved day by day
- **Investment value**: what our portfolio was worth each day, given the units held at that time

## Requirements

1. **Daily granularity** — one data point per day in the selected time range (1M, 6M, 1Y, ALL)
2. **Historical price data** — for each day, know the closing price of each held ticker
3. **Backward unit computation** — for each day, compute how many units we held by applying transactions up to that date
4. **Dual line chart** — two lines: ticker price (normalized) and portfolio value (absolute €)
5. **Time range filtering** — 1M/6M/1Y/ALL buttons filter the daily data, not just truncate it
6. **Tooltip** — hover shows date, ticker price, units held at that date, portfolio value, total invested

## Data Model

### Historical Prices (per ticker, daily)

```
Record<string, Record<string, number>>  // ticker → date-string → closing price
```

Example: `{ "VWCE.MI": { "2026-01-15": 192.50, "2026-01-16": 194.20, ... }, "SWDA.MI": { ... } }`

Stored ephemerally in the store (like `prices`), fetched on demand when time range changes.

### Units Held on Any Given Date

Derived from `etfTransactions[]` sorted by date:

```
function computeUnitsAtDate(ticker: string, date: string, transactions: IETFTransaction[]): number {
  return transactions
    .filter(t => t.ticker === ticker && t.date <= date)
    .reduce((units, t) => t.type === 'buy' ? units + t.units : units - t.units, 0);
}
```

### Chart Data Point

```typescript
interface DailyPortfolioPoint {
  date: string;
  portfolioValue: number;       // Σ(units_i × price_i)
  totalInvested: number;         // Σ(cost of all buys up to this date)
  tickerPrices: { ticker: string; price: number; units: number }[];
}
```

## Architecture

### Data Flow

```
Page Load / Time Range Change
         │
         ▼
Fetch historical prices for all held tickers
  via Yahoo Finance chart API or alternative
         │
         ▼
Generate daily chart data:
  for each day in range:
    for each ticker:
      units = computeUnitsAtDate(ticker, day, transactions)
      price = historicalPrices[ticker][day]
    portfolioValue = Σ(units × price)
    totalInvested = Σ(buy amounts up to day)
         │
         ▼
Render daily line chart (PortfolioLineChart)
  - X axis: dates
  - Y axis: portfolio value (€)
  - Optional overlay: ticker price (normalized)
```

### Store

New ephemeral state in `useInvestmentStore`:

```typescript
historicalPrices: Record<string, Record<string, number>>;
dailyChartData: DailyPortfolioPoint[];
```

### Chart Component

`PortfolioLineChart` is already built for arrays of data points. It needs:
- Accept the new `DailyPortfolioPoint[]` shape
- Support more data points (potentially hundreds for ALL)
- Show/hide marks based on density (already done: `showMark: filtered.length <= 60`)

### Time Range Filtering

Unlike the current implementation (which filters snapshots by date), the daily approach generates data per day for the FULL range and **then** windows it. The data generation is per-ticker-date, so switching from 1Y to ALL triggers a new API fetch with a wider range.

## API Research

### Option A: Yahoo Finance v8 Chart API (Direct)

**Endpoint:** `https://query1.finance.yahoo.com/v8/finance/chart/{TICKER}?range={range}&interval=1d`

**Response:** Returns OHLCV data (open, high, low, close, volume) for each day in the range.

**Pros:**
- Free, no API key
- Daily data for any ticker
- Supports 1d, 1wk, 1mo intervals
- Returns adjusted close prices

**Cons:**
- **CORS restrictions** — browser fetch will fail without a proxy
- Rate limiting (429 errors under heavy use)
- `query1.finance.yahoo.com` may be blocked in some regions

**CORS workaround:** Use a CORS proxy like `https://corsproxy.io/?` or build a small backend proxy on Vercel/Cloudflare Workers.

### Option B: yfin.dev — Check for History Endpoint

**Current usage:** `https://api.yfin.dev/v1/quote?symbols={TICKERS}`

**Tested:** `/history`, `/chart` endpoints — no response / not found.

**Status:** yfin.dev appears to be a Yahoo Finance quote proxy only. No historical data support detected.

### Option C: Financial Modeling Prep

**Endpoint:** `https://financialmodelingprep.com/api/v3/historical-price-full/{TICKER}?apikey={API_KEY}`

**Pros:**
- Free tier available (250 requests/day)
- CORS-friendly
- Historical daily data

**Cons:**
- Requires API key (free registration)
- Rate limited on free tier
- Not all European tickers supported reliably

### Option D: Alpha Vantage

**Endpoint:** `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={TICKER}&apikey={API_KEY}`

**Pros:**
- Well-documented
- Free tier (5 req/min, 500/day)

**Cons:**
- API key required
- Rate limited
- `TIME_SERIES_DAILY` returns up to 20 years of daily data

### Option E: Internal Server Proxy

Build a small middleware on the app's Firebase Functions or a free Cloudflare Worker:

```
Client → Worker → query1.finance.yahoo.com/v8/finance/chart/...
                → Returns adjusted close prices
```

**Pros:**
- No API key
- Full control over caching
- Avoids CORS issues
- Can cache responses to reduce Yahoo rate limits

**Cons:**
- Requires deploying and maintaining a serverless function
- Adds latency

## Implementation Effort

### New Files

- **`src/hooks/useHistoricalPrices.ts`** — Hook to fetch and cache historical prices for held tickers
- **`src/hooks/useDailyChartData.ts`** — Hook to generate daily data points from historical prices + transactions

### Modified Files

| File | Change |
|------|--------|
| `src/store/useInvestmentStore.ts` | Add `historicalPrices`, `dailyChartData` state; add actions |
| `src/components/investment/PortfolioLineChart.tsx` | Accept `DailyPortfolioPoint[]`, render dense series, tooltip shows units |
| `src/pages/InvestmentPage.tsx` | Wire daily chart data hook instead of `portfolio.chartData` |
| `src/hooks/useMarketData.ts` | Add `fetchHistoricalPrices` function |

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Yahoo Finance CORS blocks browser requests | High | Use CORS proxy or serverless function |
| API rate limiting for 365 data points | Medium | Cache aggressively, stagger requests |
| European ticker symbol format issues | Medium | Test with `.MI`, `.DE`, `.PA` suffixes |
| Large ALL range with daily data (1000+ points) | Low | Chart handles via mark limits; pagination if needed |

## Relationship to Current Implementation

The current snapshot-based chart and the proposed daily chart are **not mutually exclusive**. Two approaches:

### Option 1: Replace snapshots entirely
Daily chart becomes the default. `portfolioSnapshots` array is kept for Firestore backup purposes but not used for chart rendering.

### Option 2: Hybrid
- Use daily chart for 1M, 6M, 1Y ranges (where daily API data is available)
- Use snapshot-based chart for ALL range (when historical data is too expensive to fetch)

Recommended: **Option 1** — simpler UX, clearer data model.

## Open Questions

1. **API choice** — Which works reliably from the browser? Need to test Yahoo Finance + CORS proxy vs a paid service.
2. **Cache strategy** — How long to cache historical prices? Session, localStorage, Firestore?
3. **Multi-ticker handling** — If user holds VWCE and SWDA, fetch both? Aggregate into single portfolio value?
4. **Normalized price overlay** — Show ticker price as a percentage of initial price on secondary axis?
5. **Loading state** — Historical fetch could take seconds for 1Y of daily data. Show spinner?

## Future Scope

- **Auto-fetch on page load** — Fetch historical data when InvestmentPage mounts
- **Cached historical data** — Persist to Firestore subcollection to avoid re-fetching
- **Multiple ticker lines** — Show each holding's contribution to the portfolio value
- **Dividend-adjusted prices** — Yahoo Finance returns adjusted close by default
