import { fetchNewsForTickers } from "@/lib/news/client";
import { WATCHLIST_TICKERS, MONITORING_TICKERS } from "@/lib/constants";
import { buildTickerResponse } from "@/lib/yahoo-finance/quotes";
import yahooFinance from "@/lib/yahoo-finance/client";
import type { WatchlistItem } from "@/types/dashboard";
import { generateMemosFromContexts } from "./engine";
import type { TickerContext } from "./prompt";

export interface StrategyMemoBundle {
  memos: Record<string, string>;
  generatedAt: string;
}

function isWatchlistItem(
  item: WatchlistItem | { symbol: string; error: string },
): item is WatchlistItem {
  return "rs" in item;
}

async function fetchAllQuantItems(): Promise<WatchlistItem[]> {
  const sp500 = await yahooFinance.quote("^GSPC");
  const spChange = sp500.regularMarketChangePercent ?? 0;
  const allTickers = [...WATCHLIST_TICKERS, ...MONITORING_TICKERS];
  const results = await buildTickerResponse(allTickers, spChange);
  return results.filter(isWatchlistItem);
}

export async function generateStrategyMemos(): Promise<StrategyMemoBundle> {
  const allTickers = [...WATCHLIST_TICKERS, ...MONITORING_TICKERS] as const;

  const [quantItems, newsItems] = await Promise.all([
    fetchAllQuantItems(),
    fetchNewsForTickers(allTickers),
  ]);

  const newsBySymbol = new Map(newsItems.map((n) => [n.symbol, n]));
  const contexts: TickerContext[] = quantItems.map((q) => ({
    quant: {
      symbol: q.symbol,
      rs: q.rs,
      ma50Dist: q.ma50Dist,
      drawdown: q.drawdown,
      revision: q.revision,
      action: q.action,
      change1D: q.change1D,
    },
    news: newsBySymbol.get(q.symbol) ?? {
      symbol: q.symbol,
      headlines: [],
    },
  }));

  const memos = await generateMemosFromContexts(contexts);

  return {
    memos,
    generatedAt: new Date().toISOString(),
  };
}
