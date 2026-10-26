# Phase 10: Investment Tracking - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning
**Source:** Wiki feature page + user specification from `raw/81-tax-refund/`

---

<domain>
## Phase Boundary

Implement investment tracking and broker integration for the MyFinance app. This phase covers:
- ETF portfolio holdings tracking (manual entry and CSV/PDF import)
- Live market data integration via public financial APIs
- Performance charting (line chart, donut chart) with Recharts
- Investment strategy workflow: income logging → internal transfer → PAC monthly allocation
- Broker account split view (cash balance with accrued interest vs invested capital)
- Proper asset-vs-expense classification (internal transfers never counted as expenses)
- Configurable user parameters (broker name, PAC amount, interest rate, ticker)
</domain>

<decisions>
## Implementation Decisions

### Architecture & Data Layer
- **D-01:** Create a new standalone Zustand store `src/store/useInvestmentStore.ts` following the domain-specific store pattern (matching existing per-domain store approach from STRUCTURE.md)
- **D-02:** Investment data stored alongside existing user document in Firestore: add `etfTransactions`, `portfolioSnapshots`, and `brokerConfig` fields to the user document schema
- **D-03:** Firestore schema uses an array of ETF transaction records per user document, following the same pattern as `transactions[]` array in the existing schema
- **D-04:** Internal transfers are classified with `type: 'transfer'` and must be explicitly excluded from expense calculations and monthly spending KPIs

### Investment Strategy Workflow
- **D-05:** Income logging uses the existing transaction system with category `Extraordinary Income` (to be added as a default income category)
- **D-06:** Broker internal transfer is recorded via the existing transaction system but with a new `type` value — never counted as expense
- **D-07:** PAC monthly allocation deducts from broker cash balance and increases invested capital (ETF units owned + average cost basis)
- **D-08:** Net worth integrity must be maintained — internal transfers are pure asset reallocation with zero net worth impact

### User Configuration
- **D-09:** Broker settings are configurable via a settings modal: broker name, lump-sum amount, monthly PAC amount, target ticker, interest rate %
- **D-10:** Interest rate is applied to uninvested broker cash balance for accrued interest calculation (utility function/store selector)
- **D-11:** Active interest rate is annual percentage yield — monthly accrual calculated as `cashBalance * (rate / 100) / 12`

### UI & Visualization
- **D-12:** Broker view uses MUI Tabs or Cards to split into "Cash Balance" (dynamic interest) and "Invested Capital" (ETF value)
- **D-13:** Portfolio metrics: Total Invested, Current Value, Total Return (both % and absolute)
- **D-14:** Line chart for historical portfolio value (Recharts) with time ranges: 1M, 6M, 1Y, ALL
- **D-15:** Donut chart for asset allocation breakdown (even starting with a single ETF, structured to support multiple)
- **D-16:** Monthly Spending chart/KPI must strictly filter out `Internal Transfer` transactions — implement as a filter in the analytics layer

### Data Integration
- **D-17:** Live market data via public financial API (Yahoo Finance or Alpha Vantage) — fetch on portfolio view init or manual refresh
- **D-18:** CSV/PDF parser implementation is deferred to a follow-up phase — Phase 10 focuses on manual form entry and API data

### Implementation Order
- **D-19:** Schema and store first (data layer) — Firestore schema updates + Zustand store
- **D-20:** Broker config settings modal second — user-configurable parameters
- **D-21:** Transaction flow (income → transfer → PAC) third — the core workflow
- **D-22:** Portfolio visualization (charts + metrics) fourth — depends on data being available
- **D-23:** Market data integration last — depends on portfolio being set up to display fetched data

</decisions>

<canonical_refs>
## Canonical References

### Store & Data Layer
- `src/store/useFinanceStore.ts` — CRUD store pattern with async Firestore actions
- `src/store/useAuthStore.ts` — Simple standalone Zustand store pattern
- `src/store/types/finance.types.ts` — Data model interfaces (I-prefix convention)
- `src/store/types/index.ts` — Barrel re-export pattern
- `src/store/defaults.ts` — Default values (accounts, categories, modules)
- `src/store/validation/finance.validation.ts` — Validation function pattern
- `src/store/sanitization/index.ts` — Sanitization barrel
- `src/store/sync/index.ts` — Firestore init and user document helpers
- `src/lib/converters.ts` — FirestoreDataConverter typed read/write pattern

### Page & Component References
- `src/pages/CarPage.tsx` — Best parallel: tabbed module page with stat cards, tables, charts
- `src/pages/InsightsPage.tsx` — Analytics charts page with filters
- `src/pages/TransactionsPage.tsx` — Filter + table layout
- `src/pages/ConfigPage.tsx` — Tabbed settings page pattern
- `src/components/modals/TransactionModal.tsx` — Dialog modal pattern
- `src/components/forms/TransactionForm.tsx` — Form layout, validation, autocomplete
- `src/components/dashboard/RecapCards.tsx` — Stat card Paper pattern
- `src/components/dashboard/Charts.tsx` — Recharts AreaChart pattern (cash flow)
- `src/components/dashboard/AccountCard.component.tsx` — Sparkline card pattern
- `src/components/dashboard/TransactionTable.tsx` — MUI Table pattern
- `src/components/common/YearSelector.component.tsx` — Year pill selector

### Analytics & Charting
- `src/analytics/types.ts` — Analytics type definitions
- `src/analytics/hooks/useNetWorth.ts` — Custom analytics hook pattern
- `src/analytics/hooks/useCategoryBreakdown.ts` — Derived data computation
- `src/analytics/components/CategoryPieChart.tsx` — PieChart dark theme pattern
- `src/analytics/components/NetWorthChart.tsx` — AreaChart with gradient fill
- `src/analytics/components/CategoryBarChart.tsx` — Horizontal BarChart
- `src/analytics/components/MonthlyComparisonChart.tsx` — Grouped BarChart with legend

### Internationalization
- `src/locales/en.json` — English translations (flat keys, namespace-based)
- `src/locales/it.json` — Italian translations (add matching keys for both)
- `src/lib/i18n.ts` — i18next config

### Theme
- `src/theme/theme.ts` — MUI dark theme (primary: #5b6cb8, paper: #161b2e, radius: 2)

### App Structure
- `src/App.tsx` — Router, protected route pattern, module registration
- `src/store/defaults.ts` — DEFAULT_ENABLED_MODULES (financeTracker, carManagement, utilityTracker)
- `package.json` — Existing dependencies (recharts ^3.8.1, MUI ^9.0.1, lucide-react ^1.16.0)
</canonical_refs>

<specifics>
## Specific Ideas

- Brokers to support: Trade Republic, Scalable Capital (configurable name)
- ETF target example: SWDA.MI (iShares Core MSCI World UCITS ETF USD Acc)
- PMC (Prezzo Medio di Carico) = average cost basis calculation for ETF units
- Interest calculation: monthly accrual on uninvested cash balance
- Transaction type `'transfer'` — new addition to existing `'income' | 'expense'` union type
- New default income category: `Extraordinary Income` (Entrate Straordinarie)
- Market data API: Yahoo Finance (free tier) or Alpha Vantage — evaluate during implementation
- Charts: Line chart for portfolio value over time, Donut chart for asset allocation
- All charting via Recharts (already in dependencies)
- Dark theme styling consistent with existing app (#161b2e paper, rgba borders, Inter font)
</specifics>

<deferred>
## Deferred Ideas

- CSV/PDF file parser for automated broker statement uploads — deferred to follow-up phase
- Multiple broker account support — Phase 10 targets a single broker account
- Automated sync with broker APIs (no direct broker integration planned)
- Portfolio rebalancing suggestions — future feature
- Tax reporting / capital gains calculation — future feature
- Dividend tracking — future feature
- Push notifications for PAC execution — future enhancement
</deferred>

---

*Phase: 10-investment-tracking*
*Context gathered: 2026-06-26 via plan-phase orchestration*
