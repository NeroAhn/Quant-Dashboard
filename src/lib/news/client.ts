import yahooFinance from "@/lib/yahoo-finance/client";

export interface NewsHeadline {
  title: string;
  publisher: string;
  publishedAt: string;
}

export interface TickerNews {
  symbol: string;
  headlines: NewsHeadline[];
  error?: string;
}

const MAX_HEADLINES_PER_TICKER = 5;
const NEWS_LOOKBACK_DAYS = 7;

function toDate(raw: unknown): Date | null {
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") {
    return new Date(raw < 1e12 ? raw * 1000 : raw);
  }
  if (typeof raw === "string") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function isRecent(date: Date): boolean {
  const cutoff = Date.now() - NEWS_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  return date.getTime() >= cutoff;
}

async function fetchTickerNews(symbol: string): Promise<TickerNews> {
  try {
    const result = await yahooFinance.search(symbol, {
      newsCount: MAX_HEADLINES_PER_TICKER * 2,
      quotesCount: 0,
    });

    const headlines = (result.news ?? [])
      .map((n) => ({ raw: n, date: toDate(n.providerPublishTime) }))
      .filter((x) => x.date !== null && isRecent(x.date))
      .slice(0, MAX_HEADLINES_PER_TICKER)
      .map((x) => ({
        title: x.raw.title ?? "",
        publisher: x.raw.publisher ?? "",
        publishedAt: x.date!.toISOString(),
      }));

    return { symbol, headlines };
  } catch (error) {
    return {
      symbol,
      headlines: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function fetchNewsForTickers(
  symbols: readonly string[],
): Promise<TickerNews[]> {
  const results = await Promise.allSettled(symbols.map(fetchTickerNews));
  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { symbol: symbols[i], headlines: [], error: "fetch failed" },
  );
}
