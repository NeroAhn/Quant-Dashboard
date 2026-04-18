import { buildTickerResponse } from "@/lib/yahoo-finance/quotes";
import { fetchFearGreedIndex } from "@/lib/fear-greed/client";
import yahooFinance from "@/lib/yahoo-finance/client";
import {
  WATCHLIST_TICKERS,
  MONITORING_TICKERS,
  MARKET_SYMBOLS,
  MACRO_THRESHOLDS,
} from "@/lib/constants";
import type { MarketDataItem, WatchlistItem } from "@/types/dashboard";
import type { AggregatedData } from "./prompt";

/**
 * Type guard: WatchlistItem vs error-only entry.
 */
function isWatchlistItem(
  item: WatchlistItem | { symbol: string; error: string }
): item is WatchlistItem {
  return "rs" in item;
}

/**
 * Fetch market symbols (same logic as /api/market-data route).
 * Promise.allSettled for partial failure tolerance.
 */
async function fetchMarketSymbols(): Promise<MarketDataItem[]> {
  const entries = Object.entries(MARKET_SYMBOLS) as [string, string][];

  const results = await Promise.allSettled(
    entries.map(async ([name, symbol]) => {
      const quote = await yahooFinance.quote(symbol);
      return {
        name,
        symbol,
        price: quote.regularMarketPrice ?? null,
        change: quote.regularMarketChange ?? null,
        changePercent: quote.regularMarketChangePercent ?? null,
      } satisfies MarketDataItem;
    })
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    return {
      name: entries[i][0],
      symbol: entries[i][1],
      price: null,
      change: null,
      changePercent: null,
      error: result.reason?.message ?? "Unknown error",
    } satisfies MarketDataItem;
  });
}

/**
 * Aggregate all data sources for Gemini prompt construction.
 * Calls existing lib functions directly (NOT HTTP self-calls).
 */
export async function aggregateAllData(): Promise<AggregatedData> {
  // Fetch S&P 500 quote for RS baseline
  const spQuote = await yahooFinance.quote("^GSPC");
  const spChangePercent = spQuote.regularMarketChangePercent ?? 0;

  // Parallel fetch all data sources
  const [watchlistRaw, monitoringRaw, market, fearGreed] = await Promise.all([
    buildTickerResponse(WATCHLIST_TICKERS, spChangePercent),
    buildTickerResponse(MONITORING_TICKERS, spChangePercent),
    fetchMarketSymbols(),
    fetchFearGreedIndex(),
  ]);

  // Filter to successful WatchlistItem entries only
  const watchlist = watchlistRaw.filter(isWatchlistItem);
  const monitoring = monitoringRaw.filter(isWatchlistItem);

  // Compute threshold breaches
  const yieldItem = market.find((m) => m.name === "10Y Yield");
  const dxyItem = market.find((m) => m.name === "DXY");

  const thresholdBreaches = {
    yield:
      yieldItem !== undefined &&
      yieldItem.price !== null &&
      yieldItem.price > MACRO_THRESHOLDS.YIELD_10Y_WARNING,
    dxy:
      dxyItem !== undefined &&
      dxyItem.price !== null &&
      dxyItem.price > MACRO_THRESHOLDS.DXY_WARNING,
    fear:
      fearGreed !== null &&
      fearGreed.score <= MACRO_THRESHOLDS.FEAR_GREED_WARNING,
  };

  return {
    market,
    fearGreed,
    watchlist,
    monitoring,
    thresholdBreaches,
  };
}
