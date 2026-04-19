import { fetchBuffettData } from "./fetcher";
import { WATCHLIST_TICKERS } from "@/lib/constants";
import { N100_SECTOR_BY_SYMBOL } from "./universe";
import { SECTOR_BY_SYMBOL } from "@/lib/opportunities/universe";
import type { BuffettMetrics } from "@/types/buffett";
import type { BroadSector } from "@/lib/opportunities/universe";

export interface WatchlistBuffettBundle {
  metrics: Record<string, BuffettMetrics>;
  generatedAt: string;
}

function resolveSector(symbol: string): BroadSector {
  return (
    N100_SECTOR_BY_SYMBOL[symbol] ??
    SECTOR_BY_SYMBOL[symbol] ??
    "Technology"
  );
}

export async function generateWatchlistBuffett(): Promise<WatchlistBuffettBundle> {
  const results = await Promise.allSettled(
    WATCHLIST_TICKERS.map(async (symbol) => {
      const sector = resolveSector(symbol);
      const res = await fetchBuffettData({ symbol, sector });
      return res.metrics;
    }),
  );

  const metrics: Record<string, BuffettMetrics> = {};
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      metrics[r.value.symbol] = r.value;
    }
  }
  return { metrics, generatedAt: new Date().toISOString() };
}
