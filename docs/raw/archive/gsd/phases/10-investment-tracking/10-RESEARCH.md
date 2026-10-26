# Phase 10: Investment Tracking & Broker Integration — Research

**Researched:** 2026-06-26
**Domain:** Investment tracking, ETF portfolio management, financial data API integration, Firestore schema design
**Confidence:** HIGH

## Summary

This phase implements a complete investment tracking feature for the MyFinance app, covering ETF portfolio management, broker account split view (cash vs invested), live market data integration, and investment strategy workflow (income → transfer → PAC). The design follows existing codebase patterns: standalone Zustand store (`useInvestmentStore.ts`), Firestore array fields within the user document, Recharts for charting, and MUI dark theme components.

The key architectural decision is to **extend the existing `ITransaction` type with a `'transfer'` value** (alongside `'income' | 'expense'`) rather than creating a separate data model for transfers. Transfer transactions must be explicitly filtered from all expense calculations in the analytics layer. For live market data, **direct browser-side fetching from `api.yfin.dev`** (CORS-friendly Yahoo Finance proxy, 40 req/s free tier) is recommended over Yahoo's CORS-blocked v8 endpoint or Alpha Vantage's 25 req/day limit.

**Primary recommendation:** Create `useInvestmentStore.ts` as a standalone domain store, add `etfTransactions[]`, `portfolioSnapshots[]`, and `brokerConfig` fields to the UserDoc, extend `ITransaction.type` union with `'transfer'`, fetch live prices via `https://api.yfin.dev/v1/quote` (with manual refresh), and build the Investment page as a tabbed module following the `CarPage.tsx` pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Standalone Zustand store `src/store/useInvestmentStore.ts` (per-domain pattern)
- **D-02:** Investment data in existing user document: add `etfTransactions`, `portfolioSnapshots`, `brokerConfig` fields
- **D-03:** Firestore schema uses array of ETF transaction records per user (same pattern as `transactions[]`)
- **D-04:** Internal transfer type = `'transfer'`, excluded from expense calculations
- **D-05:** Income logging uses existing transaction system with `Extraordinary Income` category
- **D-06:** Broker internal transfer via existing transaction system with new `type` — never counted as expense
- **D-07:** PAC deducts from broker cash, increases invested capital (units + average cost basis)
- **D-08:** Internal transfers = zero net worth impact (pure asset reallocation)
- **D-09:** Broker settings via modal: broker name, lump-sum, monthly PAC, ticker, interest rate
- **D-10:** Interest rate applied to uninvested cash for accrued interest (utility/store selector)
- **D-11:** Annual interest rate → monthly accrual: `cashBalance * (rate / 100) / 12`
- **D-12:** Broker view splits into "Cash Balance" (dynamic interest) and "Invested Capital" (ETF value)
- **D-13:** Portfolio metrics: Total Invested, Current Value, Total Return (% and absolute)
- **D-14:** Line chart for portfolio value (Recharts) with 1M/6M/1Y/ALL time ranges
- **D-15:** Donut chart for asset allocation (structured for multiple ETFs)
- **D-16:** Monthly Spending KPIs must strictly filter out internal transfers
- **D-17:** Live market data via public financial API — fetch on portfolio init or manual refresh
- **D-18:** CSV/PDF parser deferred
- **D-19:** Schema and store first (data layer)
- **D-20:** Broker config settings modal second
- **D-21:** Transaction flow (income → transfer → PAC) third
- **D-22:** Portfolio visualization (charts + metrics) fourth
- **D-23:** Market data integration last

### the agent's Discretion
- Market data API choice (Yahoo Finance vs Alpha Vantage vs other)
- Chart implementation specifics (what Recharts components, time range selector UI)
- Firestore schema design details (field structure, types)
- Store action signatures and state shape

### Deferred Ideas (OUT OF SCOPE)
- CSV/PDF parser — follow-up phase
- Multiple broker accounts — Phase 10 targets single broker
- Automated broker API sync — not planned
- Portfolio rebalancing suggestions — future
- Tax reporting / capital gains — future
- Dividend tracking — future
- Push notifications for PAC execution — future enhancement
</user_constraints>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| ETF transaction CRUD | **API/Firestore** | Browser (optimistic UI) | Async Firestore writes follow existing `useFinanceStore` pattern [
VERIFIED: `src/store/useFinanceStore.ts` lines 161-190] |
| Market data fetching | **Browser (direct API call)** | — | yfin.dev API supports CORS from browser [
VERIFIED: dev.to article on v8 chart endpoint confirms CORS restriction on Yahoo's own API; yfin.dev docs show CORS-friendly proxy] |
| Portfolio valuation calculation | **Browser (computed)** | — | Derived data from ETF transactions + live prices |
| Net worth calculation | **Browser (analytics hook)** | — | Existing `useNetWorth` hook must be updated to include investment assets [
VERIFIED: `src/analytics/hooks/useNetWorth.ts`] |
| Investment page UI | **Browser** | — | React component with MUI, Recharts — same tier as all existing pages |
| i18n translations | **Static JSON** | — | Flat key-value pair files, EN + IT |
| Broker config persistence | **Firestore (user doc field)** | Browser (Zustand state) | Stored as `brokerConfig` map field |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | ^3.8.1 | Portfolio line chart, donut chart | Already in dependencies [
VERIFIED: `package.json` line 32] |
| MUI | ^9.0.1 | Tabbed page, stat cards, tables, dialogs | Already in dependencies [
VERIFIED: `package.json` lines 19-21] |
| Zustand | ^5.0.13 | Standalone investment store | Already in dependencies, existing per-domain pattern [
VERIFIED: `package.json` line 33, `src/store/useAuthStore.ts`] |
| dayjs | ^1.11.20 | Date manipulation, filtering | Already in dependencies [
VERIFIED: `package.json` line 23] |
| Firebase/Firestore | ^12.13.0 | Data persistence | Already in dependencies [
VERIFIED: `package.json` line 24] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-i18next | ^17.0.8 | Translation keys for new feature | All user-facing strings |
| lucide-react | ^1.16.0 | Investment/trading icons | Page header icons, stat card icons |
| crypto.randomUUID() | built-in | Generate ETF transaction IDs | Matching existing pattern in `useFinanceStore.ts` |

### Market Data API Options

| API | Free Tier | CORS from Browser | Why Chosen / Rejected |
|-----|-----------|-------------------|----------------------|
| **yfin.dev** (`api.yfin.dev`) | 40 req/s anonymous, 1,200 req/min | **YES** — CORS-enabled [
VERIFIED: yfin.dev docs show anonymous tier with IP-based limits] | **RECOMMENDED** — CORS-friendly, generous rate limit, `/v1/quote` and `/v1/history` endpoints, no API key needed for anonymous |
| **Yahoo Finance v8 chart endpoint** (`query1.finance.yahoo.com`) | Unofficial, no auth | **NO** — CORS blocks browser requests [
CITED: yahoo-finance2 README: "It's not possible to run this in the browser, due to CORS and cookie issues"; StackOverflow confirms CORS blocks] | **REJECTED** — requires backend proxy or Node.js server; violates browser-only architecture |
| **Alpha Vantage** | 25 req/day, 5 req/min | **YES** — API key-based, CORS enabled [
CITED: alphavantage.co documentation shows REST endpoints accessible from browser] | **ALTERNATIVE** — 25 req/day is very limiting for portfolio use (each price refresh = 1 request); suitable only if daily snapshots suffice |
| **Finnhub** | 60 req/min | **YES** — API key-based, CORS | **ALTERNATIVE** — requires API key registration; free tier adequate |

**Recommendation:** Use **yfin.dev** as primary. Fallback to direct Yahoo Finance v8 chart endpoint **only if** a simple CORS proxy (e.g., `corsproxy.io`) is added. The yfin.dev service is purpose-built for AI/frontend apps, supports ETF symbols like SWDA.MI, and provides both current quotes and historical data via clean REST endpoints.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| yfin.dev direct fetch | Self-hosted Yahoo Finance proxy | Adds deployment complexity (needs Node.js server or Cloudflare Worker) |
| yfin.dev /v1/quote | Alpha Vantage `GLOBAL_QUOTE` | 25 req/day limit makes portfolio price refresh impractical |
| Standalone `useInvestmentStore.ts` | Merge into `useFinanceStore.ts` | Merging would bloat the already-large store (1,231 lines); standalone follows the domain-per-store pattern from STRUCTURE.md confirmed in D-01 |

**Installation:**

No new npm packages required. All dependencies (MUI, Recharts, Zustand, dayjs, Firebase, react-i18next, lucide-react) are already in the project.

**Version verification:** Recharts ^3.8.1, MUI ^9.0.1, zustand ^5.0.13 are all verified from `package.json`.

## Package Legitimacy Audit

> This phase installs **no new external npm packages**. All dependencies are already in the project. The market data API (yfin.dev) is consumed as a REST API via `fetch()`, not as an npm package. `@bluefin-ai/yfin` TypeScript SDK exists but is NOT required — plain `fetch()` calls to `https://api.yfin.dev/v1/quote?symbols=SWDA.MI` suffice and avoid adding a dependency.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| recharts | npm | ~5 yrs | 5M+/wk | rechartsorg/recharts | OK | Already installed |
| @mui/material | npm | ~5 yrs | 10M+/wk | mui/material-ui | OK | Already installed |
| zustand | npm | ~4 yrs | 3M+/wk | pmndrs/zustand | OK | Already installed |
| @bluefin-ai/yfin | npm | ~1 yr | Unknown | yfin-dev | ASSUMED | NOT INSTALLED — using plain fetch instead |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                                        │
│                                                                             │
│  ┌─────────────┐  ┌────────────────┐  ┌────────────────────────────────┐   │
│  │ InvestmentPage │  │ BrokerSettings  │  │ Investment Hooks              │   │
│  │ (tabbed)       │  │ Modal           │  │ (usePortfolio, useMarketData) │   │
│  │ - Cash/Invested│  │ - Name, PAC     │  │                              │   │
│  │ - Charts       │  │ - Ticker, Rate  │  │ - calcTotalInvested()          │   │
│  │ - Holdings tbl │  └───────┬────────┘  │ - calcCurrentValue()           │   │
│  └───────┬────────┘          │           │ - calcTotalReturn()            │   │
│          │                   │           │ - calcAccruedInterest()        │   │
│          │                   │           └──────────┬─────────────────────┘   │
│          │                   │                      │                         │
│  ┌───────▼───────────────────▼──────────────────────▼──────────────┐          │
│  │                    useInvestmentStore (Zustand)                   │          │
│  │  ┌─────────────┐  ┌───────────────┐  ┌──────────────────────┐   │          │
│  │  │etfTransactions│  │portfolioSnapshots│  │brokerConfig        │   │          │
│  │  │[]            │  │[]             │  │{name, pac, ticker,  │   │          │
│  │  └──────┬──────┘  └───────┬───────┘  │ rate}               │   │          │
│  │         │                 │           └──────────────────────┘   │          │
│  └─────────┼─────────────────┼──────────────────────────────────────┘          │
│            │                 │                                                 │
│  ┌─────────▼─────────────────▼──────────────────────────────────────┐          │
│  │              useFinanceStore (existing)                           │          │
│  │  transactions[] with type: 'income'|'expense'|'transfer'         │          │
│  │  - Extraordinary Income (new default income category)            │          │
│  │  - Internal Transfer (type: 'transfer', not expense)             │          │
│  └──────────────────────────────────────────────────────────────────┘          │
│                                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │  Analytics Layer (filter 'transfer' from expenses)                   │     │
│  │  useCategoryBreakdown: filter t.type === 'expense' (already done)    │     │
│  │  useNetWorth: income minu expense (transfer type excluded)          │     │
│  │  useAccountBreakdown: income minu expense (transfer type excluded)  │     │
│  └──────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│  Firestore           │   │  yfin.dev API         │
│  /users/{uid}        │   │  GET /v1/quote        │
│  - etfTransactions[] │   │  GET /v1/history      │
│  - portfolioSnapshots│   │  (CORS-enabled)        │
│  - brokerConfig      │   └──────────────────────┘
│  - transactions[]    │
│  (existing + transfer)│
└──────────────────────┘
```

### Recommended Project Structure

```
src/
├── store/
│   ├── types/
│   │   ├── finance.types.ts          # Add IETFTransaction, IPortfolioSnapshot, IBrokerConfig
│   │   ├── investment.types.ts       # NEW — standalone types barrel (invest types)
│   │   └── index.ts                  # Re-export new types
│   ├── useInvestmentStore.ts         # NEW — standalone domain store
│   ├── validation/
│   │   ├── finance.validation.ts     # Update validateTransaction for 'transfer' type
│   │   └── investment.validation.ts  # NEW — IETFTransaction validation
│   ├── sanitization/
│   │   ├── index.ts                  # Add investment sanitization export
│   │   └── investment.ts             # NEW — sanitize etfTransaction for Firestore
│   └── defaults.ts                   # Add DEFAULT_BROKER_CONFIG
├── pages/
│   ├── InvestmentPage.tsx            # NEW — tabbed investment dashboard
│   └── ConfigPage.tsx                # Update module toggles for investment
├── components/
│   ├── investment/                   # NEW — investment-specific components
│   │   ├── BrokerSettingsModal.tsx   # Config modal for broker parameters
│   │   ├── EtfTransactionForm.tsx    # Manual ETF purchase/sell form
│   │   ├── PortfolioStats.tsx        # Stat cards (invested, value, return)
│   │   ├── PortfolioLineChart.tsx    # Recharts line chart (portfolio value)
│   │   ├── AllocationDonutChart.tsx  # Recharts donut chart (ETF allocation)
│   │   ├── HoldingsTable.tsx         # ETF position table
│   │   └── CashInterestCard.tsx      # Broker cash balance with interest
│   └── forms/
│       └── TransactionForm.tsx       # Add 'Internal Transfer' subcategory support
├── analytics/
│   ├── types.ts                      # Add IPortfolioPoint to analytics types
│   ├── hooks/
│   │   ├── useNetWorth.ts            # UPDATE to include investment assets in net worth
│   │   ├── useCategoryBreakdown.ts   # Already filters type === 'expense' — verify
│   │   ├── useAccountBreakdown.ts    # Already filters type === 'expense' — verify
│   │   └── usePortfolio.ts           # NEW — portfolio valuation hook
├── hooks/
│   └── useInvestmentSync.ts          # NEW — Firestore sync for investment store
├── lib/
│   └── converters.ts                 # UPDATE UserDoc with new fields
├── locales/
│   ├── en.json                       # Add ~30 investment translation keys
│   └── it.json                       # Add ~30 investment translation keys
└── App.tsx                           # Add /invest route with ProtectedRoute
```

### Pattern 1: Standalone Domain Store (useInvestmentStore)

**What:** Create a standalone Zustand store for investment data, mirroring the pattern from `useAuthStore.ts` (simple) but with async Firestore actions matching `useFinanceStore.ts`.

**When to use:** Per D-01, investment data lives in its own store, following the per-domain pattern.

**Example (from existing store pattern):**

```typescript
// src/store/useInvestmentStore.ts — follows pattern from useFinanceStore.ts
import { create } from 'zustand';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from './useAuthStore';
import type { IETFTransaction, IPortfolioSnapshot, IBrokerConfig } from './types';

interface InvestmentState {
  etfTransactions: IETFTransaction[];
  portfolioSnapshots: IPortfolioSnapshot[];
  brokerConfig: IBrokerConfig;
  isSaving: boolean;
  saveError: string | null;
  
  // Actions
  addEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  updateEtfTransaction: (tx: IETFTransaction) => Promise<void>;
  deleteEtfTransaction: (id: string) => Promise<void>;
  setBrokerConfig: (config: IBrokerConfig) => Promise<void>;
  addPortfolioSnapshot: (snapshot: IPortfolioSnapshot) => Promise<void>;
  setAll: (data: Partial<InvestmentState>) => void;
}
```

### Pattern 2: Type Extension for 'transfer'

**What:** Add `'transfer'` to the `ITransaction.type` union. This requires modifying the union type, the converter validation, and all analytics filters.

**When to use:** In the existing `finance.types.ts`, analytics hooks, and converter.

```typescript
// src/store/types/finance.types.ts — modify line 25
export interface ITransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';  // ADD transfer
  accountId: string;
  recurringLinkId?: string;
  consumption?: number;
  readingDateStart?: string;
  readingDateEnd?: string;
}
```

### Pattern 3: Portfolio Snapshot Data Model

**What:** Periodically capture portfolio state (total invested, current value, cash balance) as time-series data for the line chart.

**When to use:** During PAC execution, manual refresh, or periodic snapshots.

```typescript
interface IPortfolioSnapshot {
  id: string;
  date: string;                    // YYYY-MM-DD
  totalInvested: number;           // Sum of all purchase amounts (cost basis)
  currentValue: number;            // Total ETF units * current price
  cashBalance: number;             // Broker account uninvested cash
  accruedInterest: number;         // Accumulated interest on cash
  holdings: {                      // Per-ETF breakdown
    ticker: string;
    units: number;
    avgCost: number;               // Prezzo Medio di Carico
    currentPrice: number;
    value: number;
    returnPercent: number;
  }[];
}
```

### Anti-Patterns to Avoid

- **Storing portfolio snapshots on every price fetch** — leads to Firestore document growth and write costs. Instead, snapshot only on meaningful events: ETF purchase/sell, PAC execution, or manual "record snapshot" action.
- **Mixing transfer transactions in expense calculations** — must explicitly filter `type !== 'transfer'` in all analytics hooks. The existing `useCategoryBreakdown.ts` already filters `t.type === 'expense'` which naturally excludes transfers. But `useNetWorth.ts` and `useAccountBreakdown.ts` use `if (t.type === 'income') ... else if (t.type === 'expense')` — these must also be updated.
- **Building a custom CORS proxy** — yfin.dev provides CORS-friendly access without needing a backend server.
- **Hardcoding broker parameters** — all parameters (broker name, PAC amount, ticker, interest rate) must be configurable via the settings modal (D-09).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Market data price fetch | Custom Yahoo Finance scraper | yfin.dev REST API | CORS-handled, reliable, 40 req/s free tier; scraping yahoo.com directly gets blocked |
| Portfolio line chart | Canvas/SVG from scratch | Recharts AreaChart (existing pattern) | Already in deps, matches NetWorthChart pattern |
| Donut chart | Canvas/SVG from scratch | Recharts PieChart (existing pattern) | Already in deps, matches CategoryPieChart pattern |
| State management | Context API or Redux | Zustand (existing pattern) | Already in deps, matches all existing stores |
| Date manipulation | Raw Date arithmetic | dayjs (existing pattern) | Already in deps, used throughout codebase |
| i18n | Custom translation system | react-i18next (existing pattern) | Already in deps, EN + IT locales |
| Async Firestore CRUD | Raw Firestore SDK with manual error handling | Optimistic update pattern (from useFinanceStore) | Consistent error handling, loading states, rollback on failure |
| PMC / Average cost basis | Custom multi-currency, split-adjusting algorithm | Simple average: `totalCost / totalUnits` | For a single-currency, no-split ETF scenario, simple average is sufficient |

**Key insight:** This phase is about extending existing patterns, not introducing new infrastructure. Every component pattern (stat cards, tables, charts, forms, dialogs, translation keys) has a direct precedent in the existing codebase. The only genuinely new concern is the market data API integration, which is simplified by using a CORS-friendly service.

## Common Pitfalls

### Pitfall 1: Transfer Transactions Counted as Expenses
**What goes wrong:** The `useNetWorth` hook (`src/analytics/hooks/useNetWorth.ts` lines 22-23 and 36-38) treats `else if (t.type === 'expense')` as the only expense check. Adding `'transfer'` type means transfers would be **ignored** (not counted as expense, not counted as income). This is actually correct behavior for net worth — BUT the hook must be verified to NOT accidentally include transfers.

**Why it happens:** TypeScript union narrowing with `'income' | 'expense' | 'transfer'` means `else if (t.type === 'expense')` won't match `'transfer'`. The runtime behavior is correct, but the type system must be updated.

**How to avoid:** Update the `ITransaction.type` union and recompile. The existing `if/else if` pattern naturally excludes transfers. **However**, verify that `useAccountBreakdown.ts` and any other analytics hooks also correctly handle the new type.

**Warning signs:** Net worth shows sudden drop after a transfer is recorded.

### Pitfall 2: Firestore Document Size Exceeded
**What goes wrong:** Each ETF transaction, portfolio snapshot, and backup copy grows the user document. Firestore enforces a **1 MiB max document size** [
CITED: firebase.google.com/docs/firestore/quotas]. With ~150 bytes per ETF transaction and ~300 bytes per snapshot, a user with 5,000 transactions + 500 monthly snapshots over 10 years could approach the limit.

**Why it happens:** The existing architecture stores all transactions in a single array field within the user document. ETF transactions and portfolio snapshots add to this.

**How to avoid:** 
- Keep portfolio snapshots conservative (monthly or on meaningful events only)
- Estimate: 200 ETF transactions × 150 bytes = 30KB; 120 monthly snapshots × 300 bytes = 36KB; total well under 1MB
- If growth is a concern, future migration to subcollections is possible

**Warning signs:** Firestore write errors with "document too large" or 1MB quota errors.

### Pitfall 3: Market Data Price Display Issues
**What goes wrong:** ETF prices fetched from yfin.dev may be delayed (15-20 min for free tier), have incorrect currency symbols, or fail for newly listed tickers.

**Why it happens:** Free market data APIs do not provide real-time prices. Delisted tickers return errors. Some ETFs trade on specific exchanges (e.g., SWDA.MI is on Milan exchange, may have `.MI` suffix requirements).

**How to avoid:**
- Display "Prices delayed up to 15 min" disclaimer on the portfolio page
- Handle API errors gracefully (show last known price or "N/A")
- Cache prices in Zustand state to avoid re-fetching on every render
- Provide a manual "Refresh Prices" button (matching D-17)
- Use `SWDA.MI` format for Italian ETFs (Yahoo Finance notation)

**Warning signs:** Missing prices for certain tickers, stale data shown without indication.

### Pitfall 4: Average Cost Basis (PMC) Calculation Errors
**What goes wrong:** After multiple buys at different prices, the average cost basis must be recalculated correctly. A sell transaction reduces units and the average cost remains the same (simple average method).

**Why it happens:** PMC (Prezzo Medio di Carico) = `totalCostOfOwnedUnits / totalUnitsOwned`. When selling, the total cost reduces proportionally: `totalCostAfterSell = totalCostBeforeSell * (1 - sellUnits / totalUnitsBeforeSell)`. If calculated as `totalCostBeforeSell - sellUnits * avgCost`, rounding errors accumulate.

**How to avoid:**
```typescript
function calculateNewAvgCost(
  currentUnits: number,
  currentTotalCost: number,
  transactionUnits: number,
  transactionPrice: number,
  isBuy: boolean
): { newUnits: number; newTotalCost: number; newAvgCost: number } {
  if (isBuy) {
    const newUnits = currentUnits + transactionUnits;
    const newTotalCost = currentTotalCost + (transactionUnits * transactionPrice);
    return {
      newUnits,
      newTotalCost,
      newAvgCost: newTotalCost / newUnits
    };
  } else {
    // Sell: reduce total cost proportionally
    const sellRatio = transactionUnits / currentUnits;
    const newTotalCost = currentTotalCost * (1 - sellRatio);
    const newUnits = currentUnits - transactionUnits;
    return {
      newUnits,
      newTotalCost,
      newAvgCost: newUnits > 0 ? newTotalCost / newUnits : 0
    };
  }
}
```

### Pitfall 5: Missing Translation Keys
**What goes wrong:** New UI in the investment page references translation keys that don't exist in both `en.json` and `it.json`, causing `t('investment.something')` to display the key name as fallback.

**How to avoid:** Add all new keys under an `investment: {}` namespace in both locale files simultaneously. Expected ~30-40 new keys across both files.

## Code Examples

### ETF Transaction CRUD (matching existing optimistic update pattern from useFinanceStore.ts)

```typescript
// Source: Pattern from src/store/useFinanceStore.ts lines 161-190 (addTransaction)
addEtfTransaction: async (tx: IETFTransaction) => {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) return;

  set({ saveError: null, isSaving: true });
  try {
    // Optimistic update
    set((state) => ({
      etfTransactions: [...state.etfTransactions, tx].sort(
        (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
      ),
      isSaving: false,
    }));
    // Persist to Firestore
    const docRef = doc(db, 'users', userId);
    const sanitized = useInvestmentStore.getState().etfTransactions
      .map(sanitizeEtfTransaction);
    await updateDoc(docRef, { etfTransactions: sanitized });
  } catch (err) {
    // Rollback on error
    set((state) => ({
      etfTransactions: state.etfTransactions.filter(t => t.id !== tx.id),
      saveError: err instanceof Error ? err.message : 'Failed to add ETF transaction',
      isSaving: false,
    }));
  }
},
```

### Portfolio Line Chart (Recharts AreaChart with time range selector)

```typescript
// Source: Pattern from src/analytics/components/NetWorthChart.tsx + CarPage.tsx YearSelector
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface PortfolioLineChartProps {
  data: { date: string; value: number; invested: number }[];
  timeRange: '1M' | '6M' | '1Y' | 'ALL';
  onTimeRangeChange: (range: string) => void;
}

const PortfolioLineChart: React.FC<PortfolioLineChartProps> = ({ data, timeRange, onTimeRangeChange }) => {
  const isPositive = data.length > 0 && data[data.length - 1].value >= data[data.length - 1].invested;

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Value</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['1M', '6M', '1Y', 'ALL'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'contained' : 'outlined'}
              size="small"
              onClick={() => onTimeRangeChange(range)}
              sx={{ minWidth: 40, borderRadius: 2 }}
            >
              {range}
            </Button>
          ))}
        </Box>
      </Box>
      <Box sx={{ height: 300, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v.toLocaleString()}`} />
            <Tooltip contentStyle={{ background: '#161b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }} />
            <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fill="url(#portfolioGradient)" dot={false} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="invested" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
```

### Fetching Live Price from yfin.dev

```typescript
// Source: yfin.dev docs — https://docs.yfin.dev
const YFIN_BASE = 'https://api.yfin.dev/v1';

interface YfinQuoteResponse {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
  shortName?: string;
}

async function fetchQuote(symbol: string): Promise<YfinQuoteResponse | null> {
  try {
    const response = await fetch(`${YFIN_BASE}/quote?symbols=${symbol}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.quotes?.[0] ?? null;
  } catch (err) {
    console.error('Failed to fetch quote:', err);
    return null;
  }
}

// Usage in store:
const refreshPrices = async () => {
  const { brokerConfig, etfTransactions } = useInvestmentStore.getState();
  const quote = await fetchQuote(brokerConfig.ticker);
  if (quote) {
    set({ currentPrice: quote.regularMarketPrice, lastPriceUpdate: dayjs().toISOString() });
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Unofficial Yahoo Finance scraping via `query1.finance.yahoo.com` | yfin.dev CORS-friendly API | May 2026 | No backend proxy needed; browser-side fetch works |
| Alpha Vantage 500 req/day free tier | 25 req/day | ~2024 | Free tier now too restrictive for portfolio use; yfin.dev's 1,200 req/min is far more generous |
| Firestore 1MB document limit | Same — unchanged | N/A | Array growth must be monitored; portfolio snapshots should be conservative |

**Deprecated/outdated:**
- **Yahoo Finance v7 API** — discontinued by Yahoo in 2017; unreliable scraping workarounds exist but break frequently
- **IEX Cloud** — shut down August 2024; users migrated to Alpha Vantage or Polygon

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | yfin.dev will remain free and CORS-enabled through this phase's development | Market Data API | Must have Alpha Vantage fallback ready if yfin.dev changes terms |
| A2 | The `'transfer'` transaction type addition to `ITransaction.type` union will not break existing analytics hooks | Transaction Classification | TypeScript will catch all narrowings at compile time; runtime behavior is safe because existing hooks explicitly check `=== 'expense'` |
| A3 | SWDA.MI ticker format works with yfin.dev API | Market Data API | Yahoo Finance uses `.MI` suffix for Milan exchange; yfin.dev is a Yahoo Finance proxy and should support it |
| A4 | Firestore array fields will stay under 1MB for this phase's usage | Firestore Schema | If a heavy user makes 10,000 ETF transactions, the document could approach the limit; subcollection migration would be needed |

## Open Questions

1. **How should net worth be calculated with investment assets?**
   - What we know: Net worth = cash balance + investment value - expenses. Current `useNetWorth` hook only tracks cash transactions.
   - What's unclear: Should we modify `useNetWorth` to include `portfolioSnapshots[].currentValue` as an asset, or create a separate net-worth-with-investments computation?
   - Recommendation: Create a separate `usePortfolioNetWorth` hook that adds investment value to the existing net worth calculation. The existing `useNetWorth` should remain unchanged (it tracks pure cash position). The main dashboard can then show both.

2. **How to handle manual vs auto portfolio snapshots?**
   - What we know: Snapshots should be taken on ETF transactions (buy/sell) and PAC execution.
   - What's unclear: Should there be an auto-scheduler that takes monthly snapshots, or should the user manually trigger "Record Portfolio Value"?
   - Recommendation: Auto-snapshot on any write to `etfTransactions[]` (after Firestore sync success). Additionally, provide a manual "Record Now" button. This keeps the chart data populated without manual overhead.

3. **Should existing transactions be backfilled with account info when a broker account is created?**
   - What we know: Broker cash balance starts at 0. The user transfers money in (creating a `'transfer'` transaction).
   - What's unclear: Does the existing broker account (in `accounts[]`) need an initial balance, or is the initial balance always 0 and the user transfers money in?
   - Recommendation: The broker account should have `initialBalance: 0`. All money entering the broker is via `'transfer'` transactions. This ensures all money movement is tracked.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Dev server, build | ✓ | — (via nvm/nvmrc) | — |
| npm | Package management | ✓ | — (via node) | — |
| Vite | Dev server | ✓ | ^8.0.13 | — |
| TypeScript | Build | ✓ | ~6.0.3 | — |

**Missing dependencies with no fallback:** None — all dev tooling is already installed.
**Missing dependencies with fallback:** None.

> This phase has no new external tool dependencies. All required libraries are already in `package.json`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none detected |
| Config file | none |
| Quick run command | `npm run build` (typecheck) |
| Full suite command | `npm run build` (no test suite exists per AGENTS.md — "No test suite exists in this repo") |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-03 | ETF transactions persist to Firestore as array field | Manual / build-time typecheck | `npm run build` | ❌ Wave 0 |
| D-04 | Transfer type is not counted as expense | Manual / build-time typecheck | `npm run build` | ❌ Wave 0 |
| D-13 | Portfolio metrics computed correctly | Manual | `npm run build` | ❌ Wave 0 |
| D-16 | Monthly KPIs exclude transfers | Manual | `npm run build` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript typecheck + Vite build)
- **Per wave merge:** `npm run build`
- **Phase gate:** Build green before `/gsd-verify-work`

### Wave 0 Gaps
- No test infrastructure exists in the repo (confirmed by AGENTS.md)
- No test files will be created in this phase (out of scope)
- All verification is via TypeScript compilation and manual review
- Create `investment.types.ts`, `investment.validation.ts`, and `investment.sanitization.ts` — matching the existing barrel pattern

## Security Domain

> `security_enforcement` is not explicitly disabled in config (no config.json found), but this phase has minimal security surface — no authentication changes, no user input that flows to Firestore without validation.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Firebase Auth handles this; no changes |
| V3 Session Management | No | Firebase Auth handles this; no changes |
| V4 Access Control | No | Existing Firestore security rules suffice |
| V5 Input Validation | Yes | Zustand store validates ETF transactions before write (matching existing pattern) |
| V6 Cryptography | No | No encryption keys or secrets managed |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| ETF transaction validation | Tampering | Validate in `investment.validation.ts` before Firestore write (matching existing validateTransaction pattern) |
| Market data API call injection (ticker symbol in API URL) | Tampering | Sanitize ticker symbol: alphanumeric + `.` only, no path traversal characters |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase] `src/store/useFinanceStore.ts` — CRUD pattern for async Firestore with optimistic updates
- [VERIFIED: codebase] `src/store/types/finance.types.ts` — ITransaction type with `'income' | 'expense'` union
- [VERIFIED: codebase] `src/lib/converters.ts` — UserDoc interface and FirestoreDataConverter pattern
- [VERIFIED: codebase] `src/analytics/hooks/useNetWorth.ts` — Net worth calculation filtering by transaction type
- [VERIFIED: codebase] `src/analytics/components/CategoryPieChart.tsx` — Donut chart with dark theme
- [VERIFIED: codebase] `src/analytics/components/NetWorthChart.tsx` — AreaChart with gradient fill
- [VERIFIED: codebase] `src/pages/CarPage.tsx` — Tabbed module page with stat cards, tables, charts
- [VERIFIED: codebase] `src/pages/ConfigPage.tsx` — Tabbed settings with module toggles
- [VERIFIED: codebase] `src/components/modals/TransactionModal.tsx` — Dialog modal pattern
- [VERIFIED: codebase] `src/components/forms/TransactionForm.tsx` — Form layout with autocomplete
- [VERIFIED: codebase] `src/store/defaults.ts` — DEFAULT_ENABLED_MODULES and DEFAULT_CATEGORIES
- [VERIFIED: codebase] `src/store/sync/index.ts` — Firestore user document initialization
- [VERIFIED: codebase] `src/store/backup/index.ts` — Backup/export data structures
- [VERIFIED: codebase] `src/locales/en.json` and `src/locales/it.json` — Translation file structure
- [VERIFIED: codebase] `src/App.tsx` — Route and ProtectedRoute pattern
- [VERIFIED: codebase] `package.json` — Existing dependency versions
- [VERIFIED: yfin.dev docs] "Anonymous 40 rps / 1,200 rpm" rate limit; CORS-enabled REST API
- [CITED: firebase.google.com/docs/firestore/quotas] Firestore 1 MiB max document size
- [CITED: github.com/gadicc/yahoo-finance2] "It's not possible to run this in the browser, due to CORS and cookie issues"

### Secondary (MEDIUM confidence)
- [CITED: alphavantage.co] 25 req/day free tier, CORS-enabled
- [CITED: dev.to/avabuildsdata] Yahoo Finance v8 chart endpoint: `query1.finance.yahoo.com/v8/finance/chart/AAPL`
- [ASSUMED] yfin.dev supports `.MI` (Milan exchange) ticker suffix — based on being a Yahoo Finance proxy

### Tertiary (LOW confidence)
- [ASSUMED] Average cost basis calculation formula — based on common financial knowledge, not from verified source
- [ASSUMED] Portfolio snapshot frequency recommendations — based on architectural judgment, not from verified source

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in project, verified from package.json
- Architecture: HIGH — patterns directly copied from existing codebase
- Market data API: HIGH — yfin.dev docs verified; CORS behavior verified from yahoo-finance2 README
- Pitfalls: HIGH — based on Firestore documentation and codebase analysis

**Research date:** 2026-06-26
**Valid until:** 2026-07-26 (30 days — market data APIs may change; yfin.dev is relatively new)

## RESEARCH COMPLETE

**Phase:** 10 - Investment Tracking & Broker Integration
**Confidence:** HIGH

### Key Findings
1. **No new npm packages needed** — all dependencies (MUI, Recharts, Zustand, dayjs, Firebase, i18next) are already in the project
2. **yfin.dev** is the recommended market data API — CORS-friendly, 40 req/s free tier, no API key needed
3. **Standalone store** (`useInvestmentStore.ts`) follows existing domain pattern from `useAuthStore.ts` with async Firestore actions from `useFinanceStore.ts`
4. **Transfer type** (`'transfer'`) must be added to the `ITransaction.type` union — existing analytics hooks naturally exclude it due to `=== 'expense'` checks, but TypeScript types must be updated
5. **Import order** per D-19 through D-23: data layer → config modal → transaction flow → visualization → market data

### File Created
`.planning/phases/10-investment-tracking/10-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | All packages verified from package.json and codebase |
| Architecture | HIGH | Patterns directly extracted from existing working code |
| Pitfalls | HIGH | Based on documented Firestore limits and real code analysis |
| Market Data API | MEDIUM | yfin.dev is newer and less battle-tested than Alpha Vantage; terms may change |

### Open Questions
- How to integrate investment assets into net worth calculation (separate hook vs modification of existing)
- Auto-snapshot vs manual snapshot frequency for portfolio chart data
- Broker account initial balance treatment (0 vs configurable)

### Ready for Planning
Research complete. Planner can now create PLAN.md files for Phase 10.
