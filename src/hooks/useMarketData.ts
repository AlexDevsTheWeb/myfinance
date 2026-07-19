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

export async function fetchQuotes(tickers: string[]): Promise<Record<string, number>> {
  if (tickers.length === 0) return {};
  try {
    const response = await fetch(`${YFIN_BASE}/quote?symbols=${tickers.join(',')}`);
    if (!response.ok) return {};
    const data = await response.json();
    const quotes: YfinQuote[] = data?.quotes ?? [];
    const prices: Record<string, number> = {};
    for (const q of quotes) {
      if (q.symbol && typeof q.regularMarketPrice === 'number') {
        prices[q.symbol] = q.regularMarketPrice;
      }
    }
    return prices;
  } catch (err) {
    console.error('fetchQuotes error:', err);
    return {};
  }
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
