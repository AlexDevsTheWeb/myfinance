# Balancr - Professional Enhancements & Bug Report

## BUG REPORT: Ticker Persistence Failure
**Location:** Settings Page (`/config`)  
**Symptom:** The ETF Ticker field is not saved in the global state or backend after closing the modal or refreshing the page.

### Root Causes to Verify:
1. **Zustand Store Bound:** Verify that inside your store (e.g., `useInvestmentStore`), the `setBrokerConfig` or `updateSettings` function explicitly includes the `ticker` key in the object payload before triggering the save action.
2. **Form Binding:** Check that the input component dedicated to the ticker has the correct `name="ticker"` attribute or that the controller (if using *React Hook Form*) is properly mapping the local state value.
3. **Local Storage / Persistence Race Condition:** If you are using Zustand's `persist` middleware, ensure that the `ticker` key has not been accidentally included in a `partialize` checklist that excludes it from serialization.

---

## Enhancements for a Professional FinTech Application

### 1. Cash Model Evolution (Transition to V3)
The current calculation (`Cash Balance = Lump Sum - Invested`) assumes that the entire capital is dynamically or statically injected at the very beginning. For a professional application, this approach is fragile when dealing with real-world cash flows (e.g., staggered bank transfers, unexpected withdrawals, or extraordinary liquidity injections).
* **Solution:** Implement a **Disconnected Cash Adjustments** model. The cash balance must become an independent ledger where every liquidity movement (Deposit, Withdrawal, Interest Earned) is tracked as a `Cash` type transaction. The *Cash Balance* will then be calculated as the algebraic sum of these movements minus the actual cash spent on asset purchases.

### 2. True Multi-Ticker Architecture
Currently, the `useMarketData` hook tends to apply oversimplified logic to asset pricing.
* **Solution:** Modify the state interface to support a real asset dictionary typed as `Record<string, AssetData>`. The hook must map all active tickers, execute parallel (or batched) API calls to the pricing endpoints, and calculate the weighted total value for each individual position (`Units * CurrentPrice`).

### 3. Italian Tax Optimization (Tax Efficiency)
To elevate the app into a premium tool for the local market, two major fiscal elements need to be introduced:
* **Stamp Duty (Imposta di Bollo - 0.20%):** Add an automatic calculation for the 0.20% stamp duty on the total portfolio value (calculated pro-rata or as of December 31st each year), displaying its actual impact on the real net yield.
* **TaxPocketWidget (Capital Losses Tracking):** Create a dedicated widget to monitor the tax ledger (*zainetto fiscale*). Even though ETFs generate capital gains that cannot be offset by past capital losses under Italian law, tracking accumulated losses from other assets significantly enhances the platform's professional value.

### 4. FinTech UX & Performance Robustness
* **Spread & Fee Awareness:** Brokers often apply small spreads on recurring savings plan (PAC) execution prices or minor transaction fees. The transaction schema must include a `fees` field to separate the pure asset value from incidental costs.
* **Privacy Mode ("Eye-icon"):** Implement a global toggle in the header to mask all absolute Euro values (`***€`) and display only percentage variances. This is a crucial feature for users opening the app in public or sharing screenshots on social media or GitHub.
* **Performance (Memoization):** Ensure that heavy calculations (such as CAGR or time-weighted returns) are strictly memoized using `useMemo` and bound exclusively to changes in the transactions array, preventing redundant recalculations on every dashboard re-render.