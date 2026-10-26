# Bug Analysis — ETF Total Return stuck at €0 / prices never load

**Status:** FIXED (analyzed and resolved on 2026-08-03)
**Severity:** major
**Related feature:** [92-historical-snapshots](../../92-historical-snapshots/92-historical-snapshots.md), [94-ticker-validation](../../94-ticker-validation/94-ticker-validation.md), [dynamic-portfolio-chart](../../dynamic-portfolio-chart/dynamic-portfolio-chart.md), [ticker-persistence](../../ticker-persistence/ticker-persistence.md)

---

## Summary

On the **Investments** page → **Invested Capital** tab, **Total Return** was permanently stuck at `+€0,00 (+0.0 %)` and the portfolio **never reflected real ETF market value** — even after the broker filter fix. Current value always equalled invested cost.

## Reproduction

1. Record ETF transactions for a fund (e.g. iShares Core MSCI World).
2. Open **Invested Capital** → Total Return shows `0` no matter the price movement.
3. The Portfolio Value chart "always grows" (only reflects contributions, never price changes).

## Root Cause Analysis

### The market price provider was dead

`useMarketData.ts` called the `api.yfin.dev/v2/...` endpoint to fetch live quotes. That domain turned out to be **dead** (DNS `NXDOMAIN` — no such domain). Every quote request failed, so `prices` stayed empty. `usePortfolio` then used:

```
currentPrice = prices[ticker] ?? avgCost   // avgCost fallback
```

With no prices, `currentPrice === avgCost`, so `currentValue === totalInvested` and `Total Return = 0` forever. This was masked because the previous per-broker snapshots fallback also returned invested cost.

### Symbol ↔ venue resolution

When validating tickers (Yahoo-candidate probing), the app picked prices for symbols like `SWDA.MI` (Milan). Live checks revealed:

- `SWDA` and `EUNL` are the **same fund** — iShares Core MSCI World UCITS ETF USD (Acc), ISIN `IE00B4L5Y983`, WKN `A0RPWH`. `SWDA` is the Milan/London listing; `EUNL` is the Xetra/Stuttgart listing. They quote the same price within a few cents.
- Yahoo seeded the German venues with suffixes: Xetra `.DE`, Hamburg/Lang & Schwarz `.HM`, Frankfurt `.F`, Milan `.MI`.
- **Yahoo's Hamburg (`.HM`) quotes are frequently stale** (observed 1–7h old / pre-open), while Xetra (`.DE`) is current. Trade Republic executes on the Lang & Schwarz Exchange (Hamburg) but **displays the reference (Xetra) price** — e.g. the Trade Republic app showed `126.04 €` = Yahoo `EUNL.DE` `126.045 €`, while `EUNL.HM` was `125.32 €` (stale).

## Proposed Fix / Resolution

1. **Switch provider** to Yahoo Finance chart API: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}` (drop-in, no key). `fetchQuote`/`fetchQuotes` now resolve venations per ticker.
2. **Prefer Xetra (`.DE`) over Hamburg (`.HM`)** in the candidate order `[.DE, .HM, .F, .MI]`, because Trade Republic displays the reference market price and `.HM` is stale. Bare tickers (e.g. `EUNL`) auto-resolve to `EUNL.DE`.
3. **Consolidate the MSCI World fund on a single ticker**: change the default broker ticker from `SWDA.MI` to `EUNL`, and add an idempotent `migrateTickerSymbols()` in `useInvestmentSync.ts` that renames any `SWDA`/`SWDA.<venue>` transaction to `EUNL` (persist once on load). This also fixes the "two rows for the same fund" problem.
4. `fetchQuote` result keys are stored under the **raw transaction ticker** (`prices[ticker] = quote`), not the resolved symbol, so `usePortfolio` lookups always match.

Verified live resolution (2026-08-03):
- `EUNL` → `EUNL.DE` = **126.045 €** (Xetra) — matches the Trade Republic app's 126.04 €
- `EUNL.HM` = 125.32 € (Hamburg, stale)
- `SWDA` bare → falls back to `SWDA.MI` = 126.03 € (Milan)
- `VWCE` → `VWCE.DE` = 165 € (Xetra)

## Files Modified

- `src/hooks/useMarketData.ts` — Yahoo provider + `.DE`-first candidate resolution
- `src/store/defaults.ts` — default broker ticker `SWDA.MI` → `EUNL`
- `src/hooks/useInvestmentSync.ts` — `migrateTickerSymbols()` + fallback ticker
- `src/lib/converters.ts` — legacy `brokerConfig` ticker fallback → `EUNL`
- `src/store/validation/investment.validation.ts`, `src/locales/it.json`, `src/locales/en.json`, `src/components/investment/BrokerSettingsModal.tsx`, `EtfTransactionForm.tsx`, `DividendDialog.tsx` — placeholder/example tickers → `EUNL.DE`

## Verification

- Live Yahoo quotes confirmed for `EUNL`, `VWCE`, `SWDA` (results above).
- `npm run build` clean; `npm run lint` no new issues (pre-existing baseline errors unchanged).
- Note: prices only load on manual **Refresh Prices** (intentionally, no auto-fetch — resolved for speed; user decision earlier for the broker filter bug).

## Related

- [dynamic-portfolio-chart](../../dynamic-portfolio-chart/dynamic-portfolio-chart.md) — chart relies on manual price refresh
- [94-ticker-validation](../../94-ticker-validation/94-ticker-validation.md) — ticker format/validation against Yahoo
- [91-multi-broker](../../91-multi-broker/91-multi-broker.md) — per-broker holdings/pricing
- [ticker-persistence](../../ticker-persistence/ticker-persistence.md) — earlier broker-ticker bug