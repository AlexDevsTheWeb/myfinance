import { useCallback, useState } from 'react';
import { useInvestmentStore } from '../store/useInvestmentStore';

const YFIN_BASE = 'https://api.yfin.dev/v1';

interface YfinQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  shortName?: string;
}

export async function fetchQuote(ticker: string): Promise<YfinQuote | null> {
  try {
    const response = await fetch(`${YFIN_BASE}/quote?symbols=${ticker}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data?.quotes?.[0] ?? null;
  } catch (err) {
    console.error('fetchQuote error:', err);
    return null;
  }
}

export function useMarketData() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setCurrentPrice } = useInvestmentStore();

  const refreshPrices = useCallback(async () => {
    const { assetHoldings } = useInvestmentStore.getState();
    // Collect all unique tickers from asset holdings across all broker accounts
    const tickers = [...new Set(assetHoldings.map(h => h.ticker).filter(Boolean))];
    if (tickers.length === 0) return;

    setIsUpdating(true);
    try {
      // Single batch call to yfin.dev (supports comma-separated symbols)
      const quote = await fetchQuote(tickers.join(','));
      // yfin.dev batch returns quotes array — set the first quote's price for now
      // This maintains backward compat with single-ticker price in store
      if (quote?.regularMarketPrice) {
        setCurrentPrice(quote.regularMarketPrice);
      }
    } finally {
      setIsUpdating(false);
    }
  }, [setCurrentPrice]);

  return { refreshPrices, isUpdating };
}

export function useLastPrice(): number | null {
  return useInvestmentStore(state => state.currentPrice);
}
