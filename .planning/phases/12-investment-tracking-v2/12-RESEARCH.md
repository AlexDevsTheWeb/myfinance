# Phase 12: Investment Tracking V2 — UX & Architecture Enhancements — Research

**Researched:** 2026-06-27
**Domain:** Multi-broker investment architecture, PAC automation, historical snapshots, inflation-adjusted projections, ticker validation
**Confidence:** HIGH

## Summary

Phase 12 evolves the Phase 10 investment tracking module from a single-broker/single-ETF tool to a multi-asset platform. Six enhancement areas are scoped: PAC automation, full CRUD, multi-broker schema refactor, historical snapshots, tax/inflation modeling, and ticker validation.

The Phase 10 implementation delivered a working single-broker investment tracker with: `useInvestmentStore` (Zustand), `IBrokerConfig` (single config), `IETFTransaction[]`, `IPortfolioSnapshot[]`, Firestore persistence, yfin.dev market data integration, portfolio visualization (stats, line chart, donut chart, holdings table), and route/nav wiring. The Phase 12 architecture must refactor from the single-object `IBrokerConfig` to `BrokerAccount[]` + `AssetHolding[]` collections (D-01), migrate existing user data forward-compatibly (D-02), store historical snapshots in a separate `portfolio_history` Firestore collection (D-03), implement PAC automation via a Zustand/Firestore initialization hook (D-04), extend the projections engine with an inflation toggle (D-08), and add ticker validation at config save time (D-11).

**Primary recommendation:** Execute in a 4-wave order: (Wave 1) Multi-broker schema refactor + data migration → (Wave 2) Full CRUD UI + PAC automation hook → (Wave 3) Historical snapshots collection + ticker validation → (Wave 4) Projections inflation toggle. No new npm packages needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Multi-broker schema refactor uses collection-based types (`BrokerAccount[]`, `AssetHolding[]`) instead of single-object config
- **D-02:** All existing user data must be migrated forward-compatibly (backward-compatible schema transition)
- **D-03:** Historical snapshots stored in a new `portfolio_history` Firestore collection (separate from user document arrays)
- **D-04:** PAC automation uses a Zustand/Firestore initialization hook (not a server-side cron/worker)
- **D-05:** Broker filtering uses MUI `<Select />` dropdown — "All Brokers (Aggregated)" default view
- **D-06:** Transaction CRUD uses standard MUI icons (`Edit` / `Delete`) in table action column
- **D-07:** PAC confirmation uses notification badge pattern (consistent with existing MUI snackbar/badge components)
- **D-08:** Inflation toggle in `/projections` is a simple switch — "Adjust for Inflation (2%)"
- **D-09:** Safe deletion cascades: revert units → recalculate PMC → restore broker cash balance (atomic operation)
- **D-10:** Auto-generated PAC transactions tagged as `System-Generated Buy` (distinguishable from manual entries)
- **D-11:** Ticker validation uses a lightweight regex pre-check + optional test-fetch (non-blocking warning)
- **D-12:** Multi-broker schema refactor (D-01) is foundational — other features depend on it
- **D-13:** No new npm packages — all needed dependencies (MUI, Recharts, Zustand, Firebase, dayjs) already in project
- **D-14:** Market data continues via `api.yfin.dev` (CORS-friendly Yahoo Finance proxy)
- **D-15:** All computation remains client-side where possible (Firestore only for persistence)

### the agent's Discretion
- Wave ordering (must respect D-12: multi-broker is foundational)
- PAC confirmation badge exact UI placement
- Historical snapshot write frequency (daily vs on-event)
- Ticker validation regex exact pattern
- PMC recalculation algorithm details
- Exact Firestore subcollection schema for `portfolio_history`

### Deferred Ideas (OUT OF SCOPE)
- Server-side cron for PAC automation (client-side hook is sufficient for v1)
- TER (Tracking Expense Ratio) modeling in projections — future enhancement
- CSV/PDF import for ETF transactions — out of scope
- Real-time price polling (manual refresh only, consistent with Phase 10)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAC-01 | Auto-generate recurring monthly buy transactions | Initialization hook checks date vs PAC day, generates `System-Generated Buy` transaction |
| CRUD-01 | Edit/delete ETF transactions with PMC recalculation | Existing `updateEtfTransaction`/`deleteEtfTransaction` in store; need UI Edit/Delete buttons on HoldingsTable |
| MULTI-01 | Schema refactor: `BrokerAccount[]`, `AssetHolding[]` | Breaking change from `IBrokerConfig`; requires data migration + all store/component updates |
| HIST-01 | Persistent portfolio history in `portfolio_history` collection | New subcollection decoupled from user document array; guards against 1MB doc limit |
| TAX-01 | Inflation-adjusted projections in `/projections` | Toggle in `IProjectionInput` + adjusted chart/summary display; extends `useProjections` |
| VALID-01 | Yahoo Finance ticker validation at config save | Regex pre-check `/^[A-Z0-9]{1,5}\.(MI\|DE\|PA\|AS\|L\|TO\|F)$/i` + optional yfin.dev test-fetch |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Multi-broker data model | **Browser (Zustand store)** | Firestore (persistence) | Store owns all state; Firestore only persists |
| PAC auto-generation | **Browser (init hook)** | — | D-04 dictates client-side hook; checks date on app init |
| Broker filtering UI | **Browser (MUI Select)** | — | Pure presentation logic; no server involvement |
| Historical snapshots | **Firestore (subcollection)** | Browser (write trigger) | D-03 dictates separate collection for scalability |
| Ticker validation | **Browser (regex + test-fetch)** | — | D-11: lightweight pre-check + optional API call |
| Tax/inflation modeling | **Browser (computed)** | — | Derived data from projection engine; no storage needed |
| Safe CRUD cascades | **Browser (store logic)** | Firestore (atomic write) | D-09: optimistically update store, persist result |
| Existing user data migration | **Browser (init hook)** | Firestore (read old format) | D-02: forward-compatible; run once on first load |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | ^5.0.13 | State management for multi-broker store | Already in project, in use by Phase 10 store |
| MUI | ^9.0.1 | Select dropdown, icons, dialogs, snackbar | Already in project |
| Recharts | ^3.8.1 | Portfolio line/donut charts | Already in project |
| dayjs | ^1.11.20 | Date comparison for PAC day check | Already in project |
| Firebase/Firestore | ^12.13.0 | Data persistence + subcollections | Already in project |
| react-i18next | ^17.0.8 | Translation keys for V2 features | Already in project |

### New (zero-install) Modules
| Module | Purpose | Implementation Pattern |
|--------|---------|----------------------|
| PAC auto-generation hook | Check state against date + auto-generate | New `usePacAutomation.ts` initialization hook |
| Ticker regex validation | Pre-validate at config save | Utility function in `investment.validation.ts` |
| Inflation-adjusted projection | Real vs nominal value | Extension of `compoundInterestUtils.ts` |

### Alternatives Considered
N/A — D-13 prohibits new npm packages. All implementations must use existing dependencies.

**Installation:**
```bash
# No new npm packages required. D-13 is locked.
```

**Version verification:** All dependencies verified from `package.json` — Recharts ^3.8.1, MUI ^9.0.1, zustand ^5.0.13, dayjs ^1.11.20, firebase ^12.13.0.

## Package Legitimacy Audit

> This phase installs no new external npm packages per D-13. All dependencies are already in the project.

| Package | Registry | Age | Downloads | Verdict | Disposition |
|---------|----------|-----|-----------|---------|-------------|
| recharts | npm | ~5 yrs | 5M+/wk | OK | Already installed |
| @mui/material | npm | ~5 yrs | 10M+/wk | OK | Already installed |
| zustand | npm | ~4 yrs | 3M+/wk | OK | Already installed |
| firebase | npm | ~8 yrs | 5M+/wk | OK | Already installed |
| dayjs | npm | ~5 yrs | 8M+/wk | OK | Already installed |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Current Architecture Summary (Post-Phase 10)

### Firestore Schema (current)
```typescript
// /users/{uid} document
interface UserDoc {
  // ... existing finance fields
  etfTransactions: IETFTransaction[];    // Array of buy/sell records
  portfolioSnapshots: IPortfolioSnapshot[];  // Array of value snapshots
  brokerConfig: IBrokerConfig;           // SINGLE broker config object
}
```

### Zustand Store Shape (useInvestmentStore.ts)
```typescript
interface InvestmentState {
  etfTransactions: IETFTransaction[];    // All transactions
  portfolioSnapshots: IPortfolioSnapshot[];  // History for charting
  brokerConfig: IBrokerConfig;           // Single broker config
  currentPrice: number | null;           // Cache from yfin.dev
  lastPriceUpdate: string | null;        // Timestamp of last fetch
  isSaving: boolean;
  saveError: string | null;
  // Actions: addEtfTransaction, updateEtfTransaction, deleteEtfTransaction,
  //          setBrokerConfig, addPortfolioSnapshot, setCurrentPrice, setAll, clearSaveError
}
```

### Component Tree
```
InvestmentPage.tsx
├── BrokerSettingsModal.tsx       (5 fields: name, lumpSum, PAC, ticker, rate)
├── CashBalance Tab
│   ├── CashInterestCard.tsx      (cash balance, accrued interest, APY chip)
│   └── PortfolioLineChart.tsx    (Recharts AreaChart, 1M/6M/1Y/ALL filter)
├── Invested Capital Tab
│   ├── PortfolioStats.tsx        (3 stat cards: invested, value, return)
│   ├── HoldingsTable.tsx         (ticker, units, avgCost, price, value, return%)
│   ├── AllocationDonutChart.tsx   (Recharts PieChart with 12-color palette)
│   └── PortfolioLineChart.tsx    (same chart component)
└── EtfTransactionModal.tsx       (buy/sell form with validation)
```

### Market Data Flow
```
Browser → yfin.dev /v1/quote?symbols=SWDA.MI → setCurrentPrice(price)
Manual refresh only (button). No auto-polling. CORS-friendly.
```

### Projections Engine
```
useProjections hook
  ├── Reads brokerConfig for defaults (PAC amount, lump sum, interest rate)
  ├── generateFinancialProjection(input) → IMonthlySnapshot[]
  │     Computes: monthly ETF rate, cash rate, PAC deduction, 26% tax
  └── Returns: chartData, summary (finalCapital, interest, taxes)
```

## Multi-Broker Migration Path

### What Must Change

| Layer | Current (Phase 10) | Target (Phase 12) |
|-------|-------------------|-------------------|
| **Types** | `IBrokerConfig` (single object) | `BrokerAccount[]`, `AssetHolding[]` |
| **Store** | Single `brokerConfig` field | `brokerAccounts: BrokerAccount[]`, `selectedBrokerId: string \| 'all'` |
| **Firestore** | `brokerConfig` map in user doc | `brokerAccounts: BrokerAccount[]` in user doc, `assetHoldings: AssetHolding[]` in user doc |
| **Transactions** | `accountId` references finance accounts | `accountId` references `BrokerAccount.id` |
| **Components** | Single-broker display | Broker Select dropdown, aggregated views |
| **usePortfolio** | Computes from single `brokerConfig` | Computes per-broker and aggregated |
| **Market data** | Single ticker | Multi-ticker fetch (query all held tickers) |

### New Type Definitions
```typescript
interface BrokerAccount {
  id: string;
  name: string;             // "Trade Republic", "Degiro", etc.
  baseLumpSum: number;      // One-time initial lump sum
  interestRate: number;     // APY on uninvested cash
}

interface AssetHolding {
  ticker: string;           // "SWDA.MI", "VWCE.DE"
  brokerId: string;         // Links to BrokerAccount.id
  units: number;            // Total units in this holding
}
```

### Data Migration Strategy (D-02)
The migration from `IBrokerConfig` to `BrokerAccount[]` must handle existing users with the old schema:

```typescript
// In useInvestmentSync.ts or a dedicated migration hook:
function migrateBrokerConfig(config: IBrokerConfig | BrokerAccount[] | undefined): BrokerAccount[] {
  if (!config) return [];
  if (Array.isArray(config)) return config; // Already migrated
  // Legacy single-object → create first BrokerAccount
  return [{
    id: 'broker-1',
    name: (config as IBrokerConfig).brokerName || 'Trade Republic',
    baseLumpSum: (config as IBrokerConfig).lumpSumAmount || 0,
    interestRate: (config as IBrokerConfig).interestRate || 0,
  }];
}
```

**Key insight:** The migration must run once on first user document load. After migration, write the new `brokerAccounts` array format. The old `brokerConfig` field can be deleted or left stale.

### Store Action Changes
```typescript
interface InvestmentStateV2 {
  brokerAccounts: BrokerAccount[];
  assetHoldings: AssetHolding[];
  selectedBrokerId: string | 'all';  // D-05 filter
  etfTransactions: IETFTransaction[]; // Unchanged shape
  brokerTransactions: Map<string, IETFTransaction[]>; // { brokerId: transactions[] }
  // ... other existing fields
  
  addBrokerAccount: (account: BrokerAccount) => Promise<void>;
  updateBrokerAccount: (account: BrokerAccount) => Promise<void>;
  deleteBrokerAccount: (id: string) => Promise<void>;
  setSelectedBroker: (id: string | 'all') => void;
  // existing actions remain (addEtfTransaction, etc.) but must accept brokerId
}
```

### Reusing the Existing CRUD Pattern
The existing `useFinanceStore.ts` already has `addAccount`/`updateAccount`/`deleteAccount` for managing finance accounts. The broker account CRUD should follow the same pattern:
- Optimistic update → Firestore `updateDoc` → rollback on error
- Validate before write
- Sanitize before Firestore (uppercase ticker, number coercion)

### Component Migration
| Current Component | V2 Changes |
|-------------------|-----------|
| `BrokerSettingsModal` | Add "Add Broker Account" workflow + Broker Select |
| `CashInterestCard` | Accept multiple broker accounts, show aggregated or selected |
| `HoldingsTable` | Add `brokerId` column, filter by selected broker |
| `AllocationDonutChart` | Already scales to multi-ETF (uses `holdings` prop) |
| `PortfolioLineChart` | No structural change — already renders from snapshot data |
| `PortfolioStats` | Aggregated or per-broker |
| `InvestmentPage` | Add Broker Select dropdown (D-05) in page header |

## PAC Automation Approach

### Architecture (D-04)
PAC automation uses a Zustand/Firestore initialization hook (NOT a server-side cron):

```typescript
// src/hooks/usePacAutomation.ts
export function usePacAutomation() {
  useEffect(() => {
    const { brokerAccounts, etfTransactions, lastPacGenerationDate } = useInvestmentStore.getState();
    
    for (const broker of brokerAccounts) {
      if (broker.monthlyPacAmount <= 0) continue;
      
      const today = dayjs();
      const currentMonth = today.format('YYYY-MM');
      const pacDay = 1; // First of month by convention (configurable)
      
      // Check if PAC was already generated this month
      const pacGeneratedThisMonth = lastPacGenerationDate === currentMonth;
      if (pacGeneratedThisMonth) continue;
      
      // Check if PAC day has passed
      if (today.date() >= pacDay) {
        // Generate pending PAC transaction
        store.setPendingPacTransaction({
          brokerId: broker.id,
          amount: broker.monthlyPacAmount,
          date: today.format('YYYY-MM-DD'),
          status: 'pending_confirmation',
        });
      }
    }
  }, []);
}
```

### State Additions
Add to `useInvestmentStore`:
- `pendingPacTransaction: { brokerId: string; amount: number; date: string; status: 'pending' | 'confirmed' | 'executed' } | null`
- `lastPacGenerationDate: string | null` (YYYY-MM format, tracks which month PAC was generated)
- `pacLastGenerated: Map<string, string>` per-broker: `{ brokerId: month }`

### Workflow
1. **On app init:** `usePacAutomation` hook fires, checks if current month's PAC day has passed
2. **Generates pending transaction:** Creates `System-Generated Buy` record with `status: 'pending_confirmation'`
3. **Notification badge:** MUI Badge on nav link or inline notification — "1 PAC transaction pending"
4. **User confirmation:** Badge click opens confirmation dialog showing amount, estimated price
5. **Execution:** On confirm → fetches current price → creates `IETFTransaction` with `type: 'buy'`, `description: 'System-Generated Buy'` (D-10)
6. **Rejection:** Dismisses or allows editing the amount

### Tagging Convention (D-10)
```typescript
// Distinguishable from manual entries
const pacTransaction: IETFTransaction = {
  description: 'System-Generated Buy',
  // ... other fields same as manual
};
```

## Historical Snapshots Strategy

### Collection Design (D-03)
```typescript
// /users/{uid}/portfolio_history/{snapshotId}
interface HistorySnapshot {
  id: string;                  // Auto-generated
  date: string;                // YYYY-MM-DD
  totalInvested: number;       // Cost basis across all brokers
  currentValue: number;        // Market value across all brokers
  cashBalance: number;         // Total uninvested cash
  netWorth: number;            // currentValue + cashBalance
  brokerBreakdown?: {          // Per-broker detail (optional)
    brokerId: string;
    invested: number;
    value: number;
    cashBalance: number;
  }[];
  holdings: {                  // Snapshot of holdings at this date
    ticker: string;
    units: number;
    avgCost: number;
    price: number;
    value: number;
  }[];
  createdAt: Timestamp;        // Firestore server timestamp
}
```

### Write Frequency
- **On ETF transaction:** After each buy/sell, write a history snapshot (matches existing `addPortfolioSnapshot` behavior)
- **On manual trigger:** "Record Snapshot" button
- **Recommended guard:** Debounce to max 1 snapshot per day per user (check if today's date already has a snapshot)

### Query Pattern
```typescript
// Fetch history for charting (paginated, sorted desc)
const historyRef = collection(db, 'users', userId, 'portfolio_history');
const q = query(historyRef, orderBy('date', 'desc'), limit(365));
const snap = await getDocs(q);
```

**Key insight:** Moving from array-in-document to subcollection eliminates the 1MB document size concern and enables efficient querying. The existing `portfolioSnapshots` array in the user document can be deprecated but should remain for backward compatibility during migration.

## Tax & Inflation Modeling

### Current Projection Engine
`generateFinancialProjection()` in `compoundInterestUtils.ts` currently computes:
- Monthly ETF growth: `currentEtfValue * (1 + monthlyEtfRate)`
- Monthly cash growth: `currentBrokerCash += currentBrokerCash * monthlyCashRate`
- Annual inflow addition
- PAC deduction from cash to ETF
- Tax: 26% flat on gains (in `useProjections` hook)

### Inflation Extension (D-08)
```typescript
// Add to IProjectionInput:
interface IProjectionInput {
  // ... existing fields
  adjustForInflation?: boolean;  // default false
  inflationRate?: number;        // 0.02 (2%)
}

// In generateFinancialProjection, at the end:
function applyInflation(snapshot: IMonthlySnapshot, monthIndex: number, annualInflation: number): IMonthlySnapshot {
  if (!input.adjustForInflation) return snapshot;
  const yearsElapsed = monthIndex / 12;
  const inflationFactor = Math.pow(1 + annualInflation, yearsElapsed);
  return {
    ...snapshot,
    netWorth: Math.round(snapshot.netWorth / inflationFactor),
    etfValue: Math.round(snapshot.etfValue / inflationFactor),
    brokerCash: Math.round(snapshot.brokerCash / inflationFactor),
  };
}
```

### UI Changes
- Add `Switch` or `Toggle` to `ProjectionControls` labeled "Adjust for Inflation (2%)"
- Add `realValue` vs `nominalValue` line to `ProjectionChart` (a third area, dashed red/orange)
- Update `ProjectionSummary` to show both nominal and real final capital
- New translation keys: `projections.adjustForInflation`, `projections.inflationRate`, `projections.realValue`, `projections.nominalValue`

## Ticker Validation Method

### Regex Pre-check (D-11)
```typescript
// Yahoo Finance ticker pattern:
// - 1-5 uppercase alphanumeric characters
// - Optional exchange suffix: .MI, .DE, .PA, .AS, .L, .TO, .F
// - Case-insensitive on input (uppercased on save)
const TICKER_REGEX = /^[A-Z0-9]{1,5}\.(MI|DE|PA|AS|L|TO|F)$/i;

export function validateTicker(ticker: string): { valid: boolean; error?: string } {
  if (!ticker?.trim()) {
    return { valid: false, error: 'Ticker is required' };
  }
  if (!TICKER_REGEX.test(ticker.trim())) {
    return { valid: false, error: 'Invalid ticker format. Expected format: SYMBOL.EXCHANGE (e.g., SWDA.MI)' };
  }
  return { valid: true };
}
```

### Optional Test-Fetch (Non-blocking Warning)
```typescript
export async function validateTickerWithApi(ticker: string): Promise<{ valid: boolean; warning?: string }> {
  const regexResult = validateTicker(ticker);
  if (!regexResult.valid) return regexResult;
  
  try {
    const quote = await fetchQuote(ticker);
    if (!quote || !quote.regularMarketPrice) {
      return { valid: true, warning: `Ticker ${ticker} passes format validation but could not be verified on Yahoo Finance. Prices may not load.` };
    }
    return { valid: true };
  } catch {
    return { valid: true, warning: 'Could not validate ticker on Yahoo Finance. Check your connection.' };
  }
}
```

### Integration Point
Add validation to `BrokerSettingsModal.handleSave`:
1. Run regex pre-check on the ticker field (blocking — show error inline)
2. If regex passes, fire optional test-fetch (non-blocking — show warning)
3. On warning, allow save but display toast: "Ticker could not be verified"

## Dependencies & Risks

### Migration Complexity
| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking change for existing users with `brokerConfig` data | **HIGH** | D-02 mandates forward-compatible migration. Must detect old schema and convert on first load. |
| Firestore schema mismatch crashes existing app sessions | **MEDIUM** | `useInvestmentSync` already has `setAll` with fallback defaults. New fields should be optional-safe. |
| `IBrokerConfig` removal breaks import chains | **HIGH** | Keep `IBrokerConfig` as a legacy type during migration; remove only after migration verified. |
| Multiple async migration writes racing | **MEDIUM** | Migration must be idempotent (run-once check). Use `runTransaction` for atomic read-migrate-write. |

### Dependency Graph
```
Multi-Broker Refactor (MULTI-01)
  ├── Full CRUD (CRUD-01) — depends on multi-broker types
  ├── PAC Automation (PAC-01) — depends on multi-broker accounts
  ├── Historical Snapshots (HIST-01) — depends on new store shape
  └── Ticker Validation (VALID-01) — depends on BrokerSettingsModal only
  
Tax/Inflation (TAX-01) — independent (only touches /projections)
```

### No-New-NPM-Packages Constraint (D-13)
Implications:
- All state management: Zustand `useInvestmentStore` extensions
- All UI: MUI `Select`, `Badge`, `Snackbar`, `Switch`, `Dialog`
- All charts: Recharts (third area line for real value)
- All dates: dayjs
- All i18n: react-i18next
- All data: Firestore subcollections

## Recommended Wave Order

### Wave 1: Multi-Broker Schema Refactor (Foundation)
**Depends on:** Nothing (but everything else depends on it per D-12)

| Task | Files | Description |
|------|-------|-------------|
| 1a | `investment.types.ts` | Add `BrokerAccount`, `AssetHolding` interfaces; deprecate `IBrokerConfig` |
| 1b | `useInvestmentStore.ts` | Add `brokerAccounts: BrokerAccount[]`, `selectedBrokerId`, broker CRUD actions; migration logic from old `brokerConfig` |
| 1c | `converters.ts` | Update `UserDoc` with `brokerAccounts` field; keep `brokerConfig` for backward compat |
| 1d | `defaults.ts` | Add `DEFAULT_BROKER_ACCOUNTS` (replacing `DEFAULT_BROKER_CONFIG`) |
| 1e | `useInvestmentSync.ts` | Add migration hook for existing `brokerConfig` → `brokerAccounts[]` |
| 1f | `usePortfolio.ts` | Refactor to compute per-broker + aggregated (from `brokerAccounts`) |

### Wave 2: Full CRUD UI + PAC Automation
**Depends on:** Wave 1

| Task | Files | Description |
|------|-------|-------------|
| 2a | `HoldingsTable.tsx` | Add Edit/Delete action column with MUI icons (D-06) |
| 2b | `useInvestmentStore.ts` | Update `deleteEtfTransaction` cascading logic (revert units, recalculate PMC, restore cash — D-09) |
| 2c | `EtfTransactionModal.tsx` | Support edit mode (pre-fill existing transaction) |
| 2d | `usePacAutomation.ts` | NEW — Init hook for PAC day check + pending transaction |
| 2e | `useInvestmentStore.ts` | Add `pendingPacTransaction`, `lastPacGenerationDate` state |
| 2f | `InvestmentPage.tsx` or `Layout.tsx` | Add PAC confirmation badge notification (D-07) |
| 2g | New component | PAC confirmation dialog (amount, price, confirm/reject) |
| 2h | Locale files | Translation keys for PAC feature |

### Wave 3: Historical Snapshots + Ticker Validation
**Depends on:** Wave 1

| Task | Files | Description |
|------|-------|-------------|
| 3a | Firestore rule | Add `portfolio_history/{docId}` subcollection write rule |
| 3b | NEW `src/hooks/useHistoricalSnapshots.ts` | Hook that writes snapshots to subcollection on ETF transactions |
| 3c | `useInvestmentStore.ts` | After `addEtfTransaction`, trigger subcollection write |
| 3d | `usePortfolio.ts` | Update chart data fetching to read from subcollection |
| 3e | `investment.validation.ts` | Add `validateTicker()` regex function |
| 3f | `BrokerSettingsModal.tsx` | Integrate ticker validation on save, show warnings |
| 3g | Locale files | Translation keys for validation messages |

### Wave 4: Projections Inflation Toggle
**Depends on:** Nothing (independent module)

| Task | Files | Description |
|------|-------|-------------|
| 4a | `projection.types.ts` | Add `adjustForInflation: boolean`, `inflationRate: number` to `IProjectionInput` |
| 4b | `compoundInterestUtils.ts` | Add inflation adjustment computation in `generateFinancialProjection` |
| 4c | `useProjections.ts` | Add `setInflationToggle` action; default `adjustForInflation: false` |
| 4d | `ProjectionControls.tsx` | Add Switch component for "Adjust for Inflation (2%)" |
| 4e | `ProjectionChart.tsx` | Add third "Real Value" area line when inflation toggle is on |
| 4f | `ProjectionSummary.tsx` | Add "Real Final Capital" metric card |
| 4g | Locale files | Translation keys for inflation feature |

## Architecture Patterns

### System Architecture Diagram (V2)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Browser (React SPA)                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    usePacAutomation Hook                             │    │
│  │  Checks: pacDay passed? Already generated this month?               │    │
│  │  Output: pendingPacTransaction | null                               │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                 │
│  ┌─────────────────────────▼───────────────────────────────────────────┐    │
│  │                    useInvestmentStore (V2)                           │    │
│  │  brokerAccounts: BrokerAccount[]   assetHoldings: AssetHolding[]    │    │
│  │  selectedBrokerId: string | 'all'   pendingPacTransaction           │    │
│  │  etfTransactions: IETFTransaction[]                                  │    │
│  │  portfolioSnapshots: IPortfolioSnapshot[] (legacy)                   │    │
│  │                                                                      │    │
│  │  Actions: add/update/delete BrokerAccount, addEtfTransaction,        │    │
│  │           confirmPacTransaction, recordHistoricalSnapshot            │    │
│  └─────────┬─────────────────┬───────────────────┬─────────────────────┘    │
│            │                 │                   │                          │
│            ▼                 ▼                   ▼                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐            │
│  │ Firestore    │  │ Firestore    │  │ Firestore             │            │
│  │ /users/{uid} │  │ /users/{uid} │  │ /users/{uid}/         │            │
│  │ brokerAcc[] │  │ etfTxs[]     │  │ portfolio_history/{id} │            │
│  │ assetHold[] │  │ snapshots[]  │  │ (NEW subcollection)    │            │
│  └──────────────┘  └──────────────┘  └───────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                                                               
┌─────────────────────────────────────────────────────────────────────────────┐
│  Projections Engine (unaffected by refactor)                                │
│  useProjections → generateFinancialProjection → IMonthlySnapshot[]          │
│  Inflation toggle → apply inflation discount to each snapshot               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (New/Modified Files)
```
src/
├── store/
│   ├── types/
│   │   ├── investment.types.ts         # ADD BrokerAccount, AssetHolding; KEEP IBrokerConfig for migration
│   │   └── projection.types.ts         # ADD adjustForInflation, inflationRate to IProjectionInput
│   ├── useInvestmentStore.ts           # MODIFY: brokerAccounts[], selectedBrokerId, pac state, broker CRUD
│   ├── validation/
│   │   └── investment.validation.ts    # ADD validateTicker, validateBrokerAccount
│   └── defaults.ts                     # ADD DEFAULT_BROKER_ACCOUNTS
├── hooks/
│   ├── usePacAutomation.ts             # NEW — PAC generation init hook
│   └── useHistoricalSnapshots.ts       # NEW — Write to portfolio_history subcollection
├── components/
│   ├── investment/
│   │   ├── BrokerSettingsModal.tsx      # MODIFY: multi-broker + ticker validation
│   │   ├── HoldingsTable.tsx            # MODIFY: Edit/Delete actions column
│   │   ├── BrokerSelect.tsx             # NEW — MUI Select for broker filtering (D-05)
│   │   └── PacConfirmationDialog.tsx    # NEW — PAC confirmation UI
│   └── projections/
│       ├── ProjectionControls.tsx       # MODIFY: inflation toggle switch
│       ├── ProjectionChart.tsx          # MODIFY: real value line
│       └── ProjectionSummary.tsx        # MODIFY: real capital metric
├── pages/
│   ├── InvestmentPage.tsx               # MODIFY: broker select, PAC badge
│   └── ProjectionsPage.tsx              # MODIFY: pass inflation toggle
├── lib/
│   ├── converters.ts                    # MODIFY: update UserDoc
│   └── compoundInterestUtils.ts         # MODIFY: inflation adjustment
└── locales/
    ├── en.json                          # ADD: pac, broker, validation, inflation keys
    └── it.json                          # ADD: italian translations
```

### Pattern 1: Multi-Broker Account CRUD (matching existing account pattern)
```typescript
// src/store/useInvestmentStore.ts — following pattern from useFinanceStore.addAccount
addBrokerAccount: async (account) => {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) return;
  
  set({ saveError: null, isSaving: true });
  try {
    set((state) => ({
      brokerAccounts: [...state.brokerAccounts, account],
      isSaving: false,
    }));
    const docRef = doc(db, 'users', userId);
    const sanitized = useInvestmentStore.getState().brokerAccounts;
    await updateDoc(docRef, { brokerAccounts: sanitized });
  } catch (err) {
    set((state) => ({
      brokerAccounts: state.brokerAccounts.filter(a => a.id !== account.id),
      saveError: err instanceof Error ? err.message : 'Failed to add broker',
      isSaving: false,
    }));
  }
},
```

### Pattern 2: Broker Select Filter (D-05)
```typescript
// src/components/investment/BrokerSelect.tsx
interface BrokerSelectProps {
  brokers: BrokerAccount[];
  selected: string | 'all';
  onChange: (id: string | 'all') => void;
}

const BrokerSelect: React.FC<BrokerSelectProps> = ({ brokers, selected, onChange }) => (
  <TextField select value={selected} onChange={(e) => onChange(e.target.value)}>
    <MenuItem value="all">All Brokers (Aggregated)</MenuItem>
    {brokers.map(broker => (
      <MenuItem key={broker.id} value={broker.id}>{broker.name}</MenuItem>
    ))}
  </TextField>
);

// In usePortfolio hook, filter holdings by selectedBrokerId:
const filteredTransactions = selectedBrokerId === 'all'
  ? etfTransactions
  : etfTransactions.filter(tx => tx.accountId === selectedBrokerId);
```

### Pattern 3: Forward-Compatible Data Migration
```typescript
// In useInvestmentSync.ts — migration from old schema (D-02)
function migrateIfNeeded(data: Record<string, unknown>): { brokerAccounts: BrokerAccount[] } {
  // Check for old brokerConfig schema
  if (data.brokerConfig && !Array.isArray(data.brokerAccounts)) {
    const old = data.brokerConfig as IBrokerConfig;
    const migrated: BrokerAccount[] = [{
      id: crypto.randomUUID(),
      name: old.brokerName,
      baseLumpSum: old.lumpSumAmount,
      interestRate: old.interestRate,
    }];
    
    // Write migrated data back to Firestore (fire-and-forget)
    const docRef = getUserDocRef(useAuthStore.getState().user!.uid);
    updateDoc(docRef, { 
      brokerAccounts: migrated,
      // Keep old brokerConfig for backward compat during transition
    }).catch(console.error);
    
    return { brokerAccounts: migrated };
  }
  
  return { brokerAccounts: (data.brokerAccounts as BrokerAccount[]) ?? [] };
}
```

### Anti-Patterns to Avoid
- **Hardcoding exchange suffixes**: Ticker suffixes (.MI, .DE, .PA, .AS, .L, .TO, .F) should be a configurable validation list, not hardcoded in regex patterns
- **Blocking save on API validation failure**: D-11 mandates non-blocking warning. Never prevent saving because yfin.dev is unreachable
- **Migration running every session**: The `brokerConfig` → `brokerAccounts` migration must be idempotent. Check `!Array.isArray(data.brokerAccounts)` before migrating. After writing, the next session reads the new format
- **Writing snapshots on every render**: Historical snapshots should be rate-limited. Use a debounce (max 1 per day per user) to avoid Firestore write costs

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Broker account CRUD | Custom modal/state management | Follow existing `useFinanceStore.addAccount` optimistic update pattern (Zustand + Firestore) | Consistent with existing app patterns, fewer bugs |
| Broker filter Select | Custom dropdown | MUI `<Select />` with `MenuItem` (D-05) | Already in project, accessible |
| PAC confirmation badge | Custom notification | MUI `<Badge>` component (D-07) | Already in project |
| Inflation toggle | Custom switch | MUI `<Switch>` component | Already in project |
| Snapshot subcollection pagination | Custom cursor logic | Firestore `orderBy()` + `limit()` + `startAfter()` | Native Firestore pagination |
| Ticker validation regex | Manual string parsing | Well-known Yahoo Finance ticker pattern `/^[A-Z0-9]{1,5}\.(MI|DE|PA|AS|L|TO|F)$/i` | Community-vetted, handles edge cases |
| Multi-ticker price fetch | Multiple sequential API calls | Single yfin.dev call with comma-separated tickers: `?symbols=SWDA.MI,VWCE.DE` | yfin.dev supports batch quotes |

**Key insight:** Every pattern in Phase 12 has a direct analog in the existing Phase 10 codebase. The multi-broker CRUD mirrors `addAccount`/`updateAccount`/`deleteAccount` in `useFinanceStore`. The filter dropdown mirrors existing MUI Select patterns. The PAC hook mirrors `useInvestmentSync` init pattern.

## Common Pitfalls

### Pitfall 1: Migration Race Condition
**What goes wrong:** If the migration from `brokerConfig` to `brokerAccounts` runs concurrently with the Firestore sync's `setAll`, the store may temporarily hold stale data. The `onSnapshot` callback could overwrite the migrated state with un-migrated data.
**Why it happens:** `onSnapshot` fires asynchronously and may return old document data before the migration `updateDoc` completes.
**How to avoid:** Run the migration in `runTransaction` (atomic read + write). Set a `migrationComplete` flag in the store. Have `setAll` skip setting `brokerAccounts` if migration is in progress.
**Warning signs:** User sees "Trade Republic" broker instead of their migrated broker list.

### Pitfall 2: PAC Duplicate Generation
**What goes wrong:** If the user opens the app multiple times in one session (hot module reload during development), `usePacAutomation` fires multiple times, generating duplicate pending transactions.
**Why it happens:** React hooks re-run on re-render. Without debouncing, each render cycle checks the PAC date.
**How to avoid:** Use a `useRef` guard (`isPacChecked.current = true; if (isPacChecked.current) return;`). Store `lastPacGenerationDate` in Firestore so even across sessions the PAC is only generated once per month.
**Warning signs:** Multiple "pending confirmation" badges appear.

### Pitfall 3: Snapshot Array Bloat in Subcollection
**What goes wrong:** Writing a snapshot on every transaction + daily auto-snapshot creates 365+ documents per year. With 50K+ reads, Firestore costs accumulate.
**Why it happens:** Each snapshot write = 1 write operation. Each chart render = N reads (one per snapshot document).
**How to avoid:**
- Limit snapshots to max 1/day using `where('date', '==', today)` check before writing
- Implement snapshot compaction: keep daily for 30 days, weekly for 1 year, monthly after
- Use Firestore query `limit(365)` for chart data (enough for daily snapshots for 1 year)
**Warning signs:** Firestore usage spikes in billing dashboard.

### Pitfall 4: Ticker Validation Rejecting Valid Tickers
**What goes wrong:** The regex `/^[A-Z0-9]{1,5}\.(MI|DE|PA|AS|L|TO|F)$/i` is too restrictive. Tickers without suffixes (e.g., US stocks), tickers longer than 5 chars, or tickers on unlisted exchanges will fail validation.
**Why it happens:** European ETFs use exchange suffixes, but US ETFs/stocks often don't. The regex was designed for Italian investors (who mostly use .MI and .DE suffixes).
**How to avoid:** Make the suffix optional: `/^[A-Z0-9]{1,10}(\.[A-Z]{2})?$/i`. Keep a list of known exchange suffixes for the optional test-fetch enhancement.
**Warning signs:** User gets "Invalid ticker" for AAPL (no suffix needed) or a valid ETF with an unlisted exchange suffix.

### Pitfall 5: Inflation Adjustment Applied Incorrectly
**What goes wrong:** The inflation discount is applied to the final net worth but not to the monthly contributions. This overstates inflation's impact (lump sum is fully discounted but future contributions are only partially discounted).
**Why it happens:** Simple inflation adjustment `netWorth / (1 + inflation)^years` assumes all money was invested at time 0.
**How to avoid:** Apply inflation per-snapshot based on the weighted average time of investment. For monthly PAC contributions, the inflation adjustment should be `contribution / (1 + inflation)^(yearsRemaining)`. This is a more accurate real-value calculation.
**Warning signs:** The "real value" line drops faster than financially intuitive.

## Code Examples

### Broker Account CRUD (optimistic update pattern)
```typescript
// Source: Existing pattern from useFinanceStore.ts addAccount (lines ~350-380)
deleteBrokerAccount: async (id: string) => {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) return;
  
  set({ saveError: null, isSaving: true });
  try {
    // Optimistic: remove from state
    const deletedAccount = get().brokerAccounts.find(a => a.id === id);
    set((state) => ({
      brokerAccounts: state.brokerAccounts.filter(a => a.id !== id),
      isSaving: false,
    }));
    
    // Persist
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      brokerAccounts: useInvestmentStore.getState().brokerAccounts,
    });
  } catch (err) {
    // Rollback
    const errorMessage = err instanceof Error ? err.message : 'Failed to delete broker';
    set({ saveError: errorMessage, isSaving: false });
    // Note: rollback would need the deleted account object
    console.error('deleteBrokerAccount error:', err);
  }
},
```

### PAC Automation Init Hook
```typescript
// Source: Pattern from useInvestmentSync.ts (init + Firestore check)
export function usePacAutomation() {
  const { user } = useAuthStore();
  const { brokerAccounts, etfTransactions, pendingPacTransaction, addPendingPacTransaction } = useInvestmentStore();
  
  const hasChecked = useRef(false);
  
  useEffect(() => {
    if (!user || pendingPacTransaction || hasChecked.current) return;
    hasChecked.current = true;
    
    const today = dayjs();
    const currentMonthKey = today.format('YYYY-MM');
    
    for (const broker of brokerAccounts) {
      if (broker.monthlyPacAmount <= 0) continue;
      
      const brokerLastPacKey = `pac_${broker.id}`;
      // Read last generation month from localStorage (simple cache)
      const lastPacMonth = localStorage.getItem(brokerLastPacKey);
      
      if (lastPacMonth === currentMonthKey) continue;
      
      // PAC day is configured or default to 1st of month
      if (today.date() >= 1) {
        addPendingPacTransaction({
          brokerId: broker.id,
          amount: broker.monthlyPacAmount,
          date: today.format('YYYY-MM-DD'),
          status: 'pending',
        });
        localStorage.setItem(brokerLastPacKey, currentMonthKey);
      }
    }
  }, [user, brokerAccounts, pendingPacTransaction, addPendingPacTransaction]);
}
```

### Inflation-Adjusted Projection
```typescript
// Source: Extension of compoundInterestUtils.ts
export function generateFinancialProjection(input: IProjectionInput): IMonthlySnapshot[] {
  // ... existing calculation ...
  
  return snapshots.map(snapshot => {
    if (!input.adjustForInflation) return snapshot;
    
    const yearsElapsed = snapshot.monthIndex / 12;
    // Inflation compounds monthly for more accuracy
    const monthlyInflation = Math.pow(1 + (input.inflationRate ?? 0.02), 1 / 12) - 1;
    const inflationFactor = Math.pow(1 + monthlyInflation, snapshot.monthIndex);
    
    return {
      ...snapshot,
      netWorth: Math.round(snapshot.netWorth / inflationFactor),
      etfValue: Math.round(snapshot.etfValue / inflationFactor),
      brokerCash: Math.round(snapshot.brokerCash / inflationFactor),
    };
  });
}
```

### Historical Snapshot Write to Subcollection
```typescript
// Source: Firestore subcollection pattern
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function recordPortfolioSnapshot(userId: string, snapshot: Omit<HistorySnapshot, 'id' | 'createdAt'>) {
  const historyRef = collection(db, 'users', userId, 'portfolio_history');
  
  // Check if today already has a snapshot (debounce)
  const today = dayjs().format('YYYY-MM-DD');
  const existingQuery = query(
    historyRef,
    where('date', '==', today),
    limit(1)
  );
  const existing = await getDocs(existingQuery);
  if (!existing.empty) return; // Already recorded today
  
  await addDoc(historyRef, {
    ...snapshot,
    createdAt: serverTimestamp(),
  });
}
```

## State of the Art

| Old Approach (Phase 10) | Current Approach (Phase 12) | When Changed | Impact |
|-------------------------|----------------------------|--------------|--------|
| `IBrokerConfig` single object | `BrokerAccount[]` collection | Phase 12 | Breaking schema change — migration required |
| Snapshot array in UserDoc | `portfolio_history` subcollection | Phase 12 | Eliminates 1MB doc limit, enables efficient querying |
| Manual ETF transaction entry only | Auto-generated PAC transactions | Phase 12 | New lifecycle: pending → confirmed → executed |
| Flat 26% tax on nominal gains | Tax + inflation toggle for real value | Phase 12 | More accurate long-term projections |
| No ticker validation | Regex + optional API test-fetch | Phase 12 | Prevents broken API calls from bad ticker configs |
| Single broker view | Multi-broker with Select filter | Phase 12 | Aggregated or per-broker dashboard |

**Deprecated/outdated:**
- **`IBrokerConfig` as single object** — will remain in codebase for migration backward compat but should be marked `@deprecated`
- **`portfolioSnapshots` array in UserDoc** — new data writes to subcollection; array remains for existing users but should not be added to
- **`IBrokerConfig.monthlyPacAmount`** — moves to `BrokerAccount.monthlyPacAmount` field (not in original issue spec, but needed for per-broker PAC)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Yahoo Finance ticker regex `/^[A-Z0-9]{1,5}\.(MI\|DE\|PA\|AS\|L\|TO\|F)$/i` covers the user's relevant tickers | Ticker Validation | User may need to add more exchange suffixes; regex should be configurable |
| A2 | yfin.dev batch quote endpoint supports multiple comma-separated tickers | Market Data | If not, multi-ticker fetching needs sequential requests (slower) |
| A3 | The `portfolio_history` subcollection read count for charting stays under Firestore free tier | Historical Snapshots | 365 snapshots × 1 read each = 365 reads per chart load; fine for personal use but needs optimization at scale |
| A4 | PAC day is always the 1st of the month | PAC Automation | Should be configurable per broker; default to 1st |
| A5 | Max 1 snapshot per day is acceptable granularity for the portfolio chart | Historical Snapshots | User might want intra-day snapshots; can increase if needed |
| A6 | Existing users have `brokerConfig` map in their Firestore documents | Migration | New users without `brokerConfig` don't trigger migration; handled by `??` fallback |

## Open Questions

1. **Should broker accounts be stored in the user document array or as a subcollection?**
   - What we know: D-01 says "collection-based types" — broker accounts stored in the same user document as an array (like `etfTransactions[]`)
   - What's unclear: If a user has 20+ broker accounts, the user document grows. 20 brokers × 100 bytes = 2KB — negligible
   - Recommendation: Store `brokerAccounts` in the user document array (matching existing `accounts[]` pattern). If scale becomes an issue, subcollection migration is always possible

2. **How does the PAC confirm/reject workflow work exactly?**
   - What we know: D-07 says notification badge, D-10 says `System-Generated Buy` tag
   - What's unclear: Does the user confirm price first? What if they reject? Cancel the PAC entirely this month?
   - Recommendation: Show the pending transaction with the current market price. User can: (a) Confirm → creates buy transaction, (b) Adjust → modifies the amount/price, (c) Dismiss → suppresses for this month only

3. **What's the migration window for existing `portfolioSnapshots` array data?**
   - What we know: D-03 creates a new subcollection; old array will be read but not written to
   - What's unclear: Should existing snapshots be migrated from the array to the subcollection?
   - Recommendation: No migration needed for existing data. The chart component can read from both sources (array + subcollection) during transition. After 3 months, all users will have enough subcollection data and the array can be deprecated.

4. **Does the inflation toggle apply to taxes as well?**
   - What we know: D-08 says "Adjust for Inflation (2%)" — simple switch
   - What's unclear: Should the 26% tax estimate use nominal or real gains?
   - Recommendation: Tax is always on nominal gains (real-world tax liability). The inflation adjustment only affects the displayed "real purchasing power" chart

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Dev server, build | ✓ | — | — |
| npm | Package management | ✓ | — | — |
| Vite | Dev server | ✓ | ^8.0.13 | — |
| TypeScript | Build | ✓ | ~6.0.3 | — |
| yfin.dev API | Market data | ✓ (external) | — | Last known price fallback |
| Firebase/Firestore | Data persistence | ✓ | — | — |

**Missing dependencies with no fallback:** None — all required libraries and tools are already installed.
**Missing dependencies with fallback:** None — D-13 ensures no new packages.

## Validation Architecture

> `workflow.nyquist_validation` not explicitly set in config — treated as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | none detected (AGENTS.md: "No test suite exists in this repo") |
| Config file | none |
| Quick run command | `npm run build` (TypeScript typecheck) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MULTI-01 | BrokerAccount CRUD persists to Firestore | Build-time typecheck | `npm run build` | ❌ Wave 0 |
| MULTI-01 | Migration converts old `brokerConfig` to `BrokerAccount[]` | Manual | `npm run build` | ❌ Wave 0 |
| MULTI-01 | Broker Select filter shows correct holdings | Manual | `npm run build` | ❌ Wave 0 |
| PAC-01 | PAC generates on day of month | Manual | `npm run build` | ❌ Wave 0 |
| PAC-01 | PAC doesn't generate twice in same month | Manual | `npm run build` | ❌ Wave 0 |
| CRUD-01 | Deleting transaction reverts PMC correctly | Manual | `npm run build` | ❌ Wave 0 |
| HIST-01 | Snapshot writes to subcollection | Manual | `npm run build` | ❌ Wave 0 |
| TAX-01 | Inflation toggle affects chart display | Manual | `npm run build` | ❌ Wave 0 |
| VALID-01 | Invalid ticker regex returns error | Manual | `npm run build` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build`
- **Phase gate:** Build green before `/gsd-verify-work`

### Wave 0 Gaps
- No test infrastructure exists (confirmed by AGENTS.md)
- No test files — all verification via TypeScript compilation + manual testing
- Key migration logic must be manually verified (run migration, check Firestore output)

## Security Domain

> `security_enforcement` is not explicitly disabled — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Firebase Auth unchanged |
| V3 Session Management | No | Firebase Auth unchanged |
| V4 Access Control | No | Existing Firestore rules suffice; subcollections inherit parent doc rules |
| V5 Input Validation | Yes | Ticker regex validation, broker name sanitization, account ID validation |
| V6 Cryptography | No | No new secrets or keys |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Ticker injection in validation regex | Tampering | Regex `/^[A-Z0-9]{1,5}\.[A-Z]{2,3}$/i` allows only alphanumeric + dot — no path traversal or script injection |
| Firestore subcollection write without auth | Spoofing | Subcollections inherit parent doc security rules; user must be authenticated and own the uid |
| PAC duplicate generation (idempotency) | Tampering | `lastPacGenerationDate` stored per-broker; client-side check prevents duplicate generation within the same month |
| Broker account name injection in Firestore | Tampering | Sanitization via existing `sanitizeBrokerConfig` pattern (string coercion, ticker uppercase) |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase] `src/store/useInvestmentStore.ts` — Current store with CRUD, optimistic updates, portfolio snapshots
- [VERIFIED: codebase] `src/store/types/investment.types.ts` — IBrokerConfig, IETFTransaction, IPortfolioSnapshot, IInvestmentHolding, IPortfolioPoint
- [VERIFIED: codebase] `src/pages/InvestmentPage.tsx` — Current tabbed investment page
- [VERIFIED: codebase] `src/components/investment/` — All 8 investment components
- [VERIFIED: codebase] `src/hooks/useProjections.ts` — Projections hook with tax calculation
- [VERIFIED: codebase] `src/lib/compoundInterestUtils.ts` — Financial projection engine
- [VERIFIED: codebase] `src/components/projections/` — All 4 projection components
- [VERIFIED: codebase] `src/analytics/hooks/usePortfolio.ts` — Portfolio metrics computation
- [VERIFIED: codebase] `src/store/types/projection.types.ts` — IProjectionInput, IMonthlySnapshot
- [VERIFIED: codebase] `src/hooks/useMarketData.ts` — yfin.dev quote fetch
- [VERIFIED: codebase] `src/hooks/useInvestmentSync.ts` — Firestore sync + init pattern
- [VERIFIED: codebase] `src/locales/en.json`, `src/locales/it.json` — Existing translation keys
- [VERIFIED: codebase] `.planning/phases/12-investment-tracking-v2/12-CONTEXT.md` — Locked decisions
- [VERIFIED: codebase] `docs/YATF/architecture/investment-tracking-architecture.md` — Architecture doc

### Secondary (MEDIUM confidence)
- [CITED: raw/ux-improvments.md] — Original UX analysis document
- [CITED: raw/89-pac-automation/issue.md] — PAC requirements
- [CITED: raw/90-crud-transactions/issue.md] — CRUD requirements
- [CITED: raw/91-multi-broker/issue.md] — Multi-broker schema requirements
- [CITED: raw/92-historical-snapshots/issue.md] — Snapshot requirements
- [CITED: raw/93-tax-inflation/issue.md] — Tax/inflation requirements
- [CITED: raw/94-ticker-validation/issue.md] — Ticker validation requirements
- [ASSUMED] Yahoo Finance ticker regex pattern — based on training data for Yahoo Finance ticker format (European exchanges use .XX suffix)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all dependencies verified from project
- Architecture: HIGH — patterns directly extracted from existing Phase 10 code
- Multi-broker migration: MEDIUM — the migration path is clear but the exact edge cases depend on user data
- PAC automation: MEDIUM — the hook pattern is clear but the UX flow (pending → confirmed) needs refinement
- Historical snapshots: HIGH — subcollection pattern well-understood
- Ticker validation: MEDIUM — regex pattern may need adjustment for real-world tickers
- Tax/inflation: HIGH — simple additive computation

**Research date:** 2026-06-27
**Valid until:** 2026-07-27 (30 days — stable libraries, no API changes expected)

## RESEARCH COMPLETE

**Phase:** 12 - Investment Tracking V2 — UX & Architecture Enhancements
**Confidence:** HIGH

### Key Findings
1. **No new npm packages needed (D-13)** — all features achievable with existing dependencies (Zustand, MUI, Recharts, Firebase, dayjs, i18next)
2. **Multi-broker refactor is the foundation (D-12)** — Waves 1–3 depend on it; it's the highest-risk, highest-value change
3. **Forward-compatible migration is critical (D-02)** — existing users have `brokerConfig` in Firestore; must detect and convert to `BrokerAccount[]` without data loss
4. **Projections inflation toggle is independent** — only touches `/projections` page; can be implemented in parallel (Wave 4)
5. **Transaction CRUD already exists in store** — `updateEtfTransaction` and `deleteEtfTransaction` exist in `useInvestmentStore`; only the UI Edit/Delete buttons in HoldingsTable need adding
6. **4-wave execution recommended** — Wave 1 (schema), Wave 2 (CRUD+PAC), Wave 3 (snapshots+validation), Wave 4 (projections)
7. **Yahoo Finance ticker regex should be permissive** — `/^[A-Z0-9]{1,10}(\.[A-Z]{2,3})?$/i` covers more cases than the restrictive `/^[A-Z0-9]{1,5}\.(MI|DE|PA|AS|L|TO|F)$/i`

### File Created
`.planning/phases/12-investment-tracking-v2/12-RESEARCH.md`

### Confidence Assessment
| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | No new packages; everything verified from existing codebase |
| Architecture | HIGH | All patterns have direct analogs in existing Phase 10 code |
| Multi-Broker Migration | MEDIUM | Migration logic depends on real user data shape; test with actual Firestore |
| PAC Automation | MEDIUM | UX flow needs discussion; technical hook pattern is straightforward |
| Historical Snapshots | HIGH | Subcollection pattern is well-established Firestore practice |
| Ticker Validation | MEDIUM | Regex needs tuning; API test-fetch behavior at save time needs care |
| Tax/Inflation | HIGH | Simple additive computation; no architectural risk |

### Ready for Planning
Research complete. Planner can now create PLAN.md files for Phase 12.
