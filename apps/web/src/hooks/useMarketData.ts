import { useCallback, useState } from 'react';
import { useInvestmentStore } from '../store/useInvestmentStore';

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface YfinQuote {
  symbol: string;
  regularMarketPrice: number;
  currency?: string;
  shortName?: string;
}

/**
 * Yahoo suffixes for the German venues, tried in priority order.
 *
 * Trade Republic executes on the Lang & Schwarz Exchange (LSX, part of the
 * Hamburg exchange — Yahoo reports those listings as `.HM`), but Trade
 * Republic displays the reference market price and Yahoo's Hamburg quotes are
 * frequently stale. Xetra (`.DE`) is the current reference market for
 * German-listed ETFs, so it is preferred; `.HM` is kept as a fallback for
 * tickers that only exist on Hamburg. Then Frankfurt (`.F`), then Milan
 * (`.MI`).
 */
const SUFFIX_CANDIDATES = ['.DE', '.HM', '.F', '.MI'];

const HAS_SUFFIX_REGEX = /\.[A-Z]{2,3}$/i;

function yahooSymbolCandidates(ticker: string): string[] {
  const clean = ticker.trim().toUpperCase();
  if (!clean) return [];
  if (HAS_SUFFIX_REGEX.test(clean)) return [clean];
  return [clean, ...SUFFIX_CANDIDATES.map(s => clean + s)];
}

export async function fetchQuote(ticker: string): Promise<YfinQuote | null> {
  for (const symbol of yahooSymbolCandidates(ticker)) {
    try {
      const response = await fetch(`${YAHOO_BASE}/${encodeURIComponent(symbol)}?range=1d&interval=1d`);
      if (!response.ok) continue;
      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && typeof meta.regularMarketPrice === 'number') {
        return {
          symbol: meta.symbol ?? symbol,
          regularMarketPrice: meta.regularMarketPrice,
          currency: meta.currency,
          shortName: meta.shortName,
        };
      }
    } catch {
      // try next candidate venue
    }
  }
  return null;
}

export async function fetchQuotes(tickers: string[]): Promise<Record<string, number>> {
  if (tickers.length === 0) return {};
  const results = await Promise.all(
    tickers.map(async ticker => ({ ticker, quote: await fetchQuote(ticker) }))
  );
  const prices: Record<string, number> = {};
  for (const { ticker, quote } of results) {
    if (quote) {
      prices[ticker] = quote.regularMarketPrice;
    }
  }
  return prices;
}

export function useMarketData() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setPrices, recomputeSnapshots } = useInvestmentStore();

  const refreshPrices = useCallback(async () => {
    const { etfTransactions } = useInvestmentStore.getState();
    const tickers = [...new Set(etfTransactions.map(t => t.ticker).filter(Boolean))];
    if (tickers.length === 0) return;

    setIsUpdating(true);
    try {
      const prices = await fetchQuotes(tickers);
      if (Object.keys(prices).length > 0) {
        setPrices(prices);
        recomputeSnapshots();
      }
    } finally {
      setIsUpdating(false);
    }
    useInvestmentStore.getState().takeSnapshot();
  }, [setPrices, recomputeSnapshots]);

  return { refreshPrices, isUpdating };
}

export function useLastPrice(): number | null {
  return useInvestmentStore(state => state.currentPrice);
}
