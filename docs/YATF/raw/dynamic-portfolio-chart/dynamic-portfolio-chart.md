# Dynamic Portfolio Chart — Live Market Valuation for Historical Chart

## Problem

The Portfolio Value line chart on `/investments` displays static snapshot data: each data point is the portfolio's `currentValue` at the moment the snapshot was recorded (i.e., when a transaction was added or deleted). Refreshing market prices updates the live stats (current value, return percent) and per-holding prices, but **never recalculates existing snapshots**. The chart therefore shows a flat line or stale history, not a dynamic time series reflecting current market conditions.

The "Prices delayed up to 15 min" label suggests the chart should reflect live-ish market data, but the implementation doesn't support it.

Additionally, the chart has a **tooltip/label bug**: the series labels ("Portfolio Value", "Invested") do not appear when hovering over the chart. The tooltip is configured with the default axis trigger but the labels don't render properly in the current `ChartsWrapper`/`ChartsSurface` structure. Marks are also hidden when there are multiple data points (`showMark: filtered.length <= 1`), so item-level triggers have nothing to latch onto.

## Root Cause

- `currentPrice` in the store is a **single number** applied uniformly to all tickers — wrong for multi-broker with different ETFs
- `portfolioSnapshots[]` are static records — computed once via `computeSnapshot()` at transaction time and never updated
- `refreshPrices` fetches per-ticker prices from yfin.dev but stores only the first quote's price into `currentPrice`, and does not trigger any snapshot recalculation
- Chart data (`usePortfolio.chartData`) maps snapshots 1:1 with no dynamic recomputation
- `IPortfolioPoint` type (`{ date, value, invested }`) has no field for unit counts — cannot display per-ticker units in tooltip
- `PortfolioLineChart` uses `ChartsTooltip` outside `ChartsWrapper` + hides marks when data has >1 point — tooltip labels don't render correctly

## Requirements for Fix

1. Store **per-ticker prices** (map of ticker → price) instead of a single `currentPrice`
2. When refreshing prices, store all fetched prices per-ticker
3. When prices are updated, **recompute all existing snapshots** — each snapshot holds per-holding unit counts, so `currentValue` can be recalculated as `Σ(holding.units × currentPrice[ticker])`
4. Use per-ticker prices in the live portfolio computation (holdings table, stats) too — currently falls back to `avgCost` when `currentPrice` is null
5. Persist `prices` map to Firestore so it survives page reload
6. Fix tooltip: ensure series labels appear on hover; optionally switch to `trigger="item"` with visible marks
7. Include per-holding unit counts in chart data so tooltip can display units breakdown per ticker

## Impact Analysis

### Files to Modify

| File | Change | Impact |
|------|--------|--------|
| `src/store/types/investment.types.ts` | Add `prices: Record<string, number>` to store state interface | Low — additive, no breaking changes |
| `src/store/useInvestmentStore.ts` | Replace `currentPrice` with `prices` map; update `computeSnapshot()` to use per-ticker prices; add `setPrices()` action; add `recomputeSnapshots()` action; update Firestore write to persist `prices` | **Medium** — store schema change, new action, snapshot recomputation logic |
| `src/hooks/useMarketData.ts` | Update `refreshPrices` to store all fetched quotes in `prices` map instead of single `currentPrice`; call `recomputeSnapshots()` after price refresh | Low-medium — logic change, same API dependency |
| `src/analytics/hooks/usePortfolio.ts` | Use `prices[ticker]` per-holding instead of single `currentPrice`; update dependency array | Low — mostly drop-in replacement |
| `src/hooks/useHistoricalSnapshots.ts` | Update `computeHistorySnapshot` to accept `prices` map; use per-ticker pricing | Low — signature change |
| `src/lib/converters.ts` | Handle `prices` field in Firestore serialization/deserialization | Low — additive |
| `src/store/sync/useInvestmentSync.ts` (or similar) | Include `prices` in sync fields | Low — additive |

### Files NOT Changed

- `PortfolioStats.tsx`, `HoldingsTable.tsx` — they read from `usePortfolio()` which will transparently use per-ticker prices
- `InvestmentPage.tsx` — orchestrator; no direct change
- `CashInterestCard.tsx`, `AllocationDonutChart.tsx` — unrelated

### Migration

- Existing `currentPrice` field in Firestore can be migrated to `prices: {}` on first sync (backward-compat read in converter)
- Single-price users get `prices: {}` initially, which falls back to `avgCost` per holding (same as current behavior)
- No data loss — snapshots already store per-holding unit counts; only `currentValue` is stale

### Total Scope

- **~8 files modified** (no new files)
- **2 new store actions**: `setPrices()`, `recomputeSnapshots()`
- **2 schema changes**: `currentPrice: number | null` → `prices: Record<string, number>`; `IPortfolioPoint` extended with holdings info for tooltip
- **1 UI component changed**: `PortfolioLineChart.tsx` — fix tooltip rendering, add units display
- **No new dependencies**
- **No API changes** (still uses yfin.dev)

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Per-ticker price missing for some tickers | Medium | Fall back to `avgCost` per-holding (same as current behavior) |
| Large snapshot array causes slow recomputation | Low | Snapshots are limited to transaction count (typically < 100); O(n) recomputation is instant |
| Firestore write size limit for `prices` map | Low | Prices map is ~100 bytes per ticker; well under Firestore's 1MB doc limit |
| Race condition: price refresh during transaction add | Low | `recomputeSnapshots` reads fresh state; sequential action |
| MUI X Charts tooltip API mismatch | Medium | Check installed version's API for `ChartsTooltip` placement and trigger props; fallback to axis trigger with formatted labels |

### Chart Data & Tooltip Changes

The chart data structure needs to carry per-holding information for tooltip display:

```typescript
// BEFORE
interface IPortfolioPoint {
  date: string;
  value: number;
  invested: number;
}

// AFTER
interface IPortfolioHoldingInfo {
  ticker: string;
  units: number;
  price: number;
  avgCost: number;
}

interface IPortfolioPoint {
  date: string;
  value: number;
  invested: number;
  holdings: IPortfolioHoldingInfo[];  // per-ticker breakdown for tooltip
}
```

The tooltip fix requires:
1. Ensure `ChartsTooltip` renders inside `ChartsWrapper` (not after it) or use the correct MUI X Charts API for the installed version
2. Set `showMark: true` (or `filtered.length <= 20`) so data points are visible and hoverable
3. Use a custom tooltip via `slotProps={{ tooltip: { ... } }}` to render per-ticker holdings breakdown when hovering a point

## Implementation Approach (Recommended)

### Step 1: Store — per-ticker prices

```typescript
// State change
currentPrice: number | null;        // BEFORE
prices: Record<string, number>;     // AFTER (add alongside, deprecate currentPrice)
```

### Step 2: Market data hook — fetch & store per-ticker

```typescript
// useMarketData.ts
const prices: Record<string, number> = {};
for (const quote of data.quotes) {
  if (quote.symbol && quote.regularMarketPrice) {
    prices[quote.symbol] = quote.regularMarketPrice;
  }
}
setPrices(prices);
```

### Step 3: Recompute snapshots after price refresh

```typescript
// useInvestmentStore.ts
recomputeSnapshots: () => {
  const { portfolioSnapshots, prices } = get();
  const updated = portfolioSnapshots.map(snapshot => ({
    ...snapshot,
    holdings: snapshot.holdings.map(h => {
      const currentPrice = prices[h.ticker] ?? h.avgCost;
      return {
        ...h,
        currentPrice,
        value: h.units * currentPrice,
        returnPercent: h.avgCost > 0 ? ((currentPrice - h.avgCost) / h.avgCost) * 100 : 0,
      };
    }),
    currentValue: snapshot.holdings.reduce((sum, h) => {
      const price = prices[h.ticker] ?? h.avgCost;
      return sum + h.units * price;
    }, 0),
  }));
  set({ portfolioSnapshots: updated });
}
```

### Step 4: Use per-ticker prices in live portfolio computation

```typescript
// usePortfolio.ts
const price = prices[tx.ticker] ?? (latestSnapshot && totalUnits > 0
  ? latestSnapshot.currentValue / totalUnits
  : null);
```

## Alternative Approaches Considered

| Approach | Pros | Cons |
|----------|------|------|
| **A — Recompute snapshots on price refresh** (recommended) | Minimal changes, snapshots stay as data source, backward compatible | Snapshots retroactively reflect current prices (not true historical prices) |
| **B — Compute chart data dynamically from transactions** | No snapshot dependency; true history | Requires recomputing holding state at every date point; more complex; doesn't use snapshot data |
| **C — Fetch historical prices per ticker** | Most accurate historical chart | Requires new API endpoint (yfin.dev may not support); much higher complexity; rate limiting |
| **D — Do nothing, document limitation** | Zero code change | User confusion persists; chart remains misleading |

Approach A is recommended as the best cost/benefit ratio.
