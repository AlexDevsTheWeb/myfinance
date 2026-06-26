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
    const ticker = useInvestmentStore.getState().brokerConfig.ticker;
    if (!ticker) return;

    setIsUpdating(true);
    try {
      const quote = await fetchQuote(ticker);
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
