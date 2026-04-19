import { NASDAQ_100 } from "./universe";
import { isExcluded } from "./exclusions";
import { fetchBuffettData } from "./fetcher";
import { fetchNewsForTickers } from "@/lib/news/client";
import { generateMemosFromContexts } from "@/lib/strategy-memo/engine";
import type { TickerContext } from "@/lib/strategy-memo/prompt";
import type { BuffettMetrics } from "@/types/buffett";

const MARKET_CAP_MIN = 2_000_000_000; // $2B

export interface BuffettOppBundle {
  entries: BuffettMetrics[];
  generatedAt: string;
  stats: {
    universeSize: number;
    excludedByIndustry: number;
    failedFetch: number;
    failedMarketCap: number;
    failedIncome: number;
    eligible: number;
    picks: number;
  };
}

async function fetchAllBuffett(): Promise<{
  ok: BuffettMetrics[];
  excludedByIndustry: number;
  failedFetch: number;
  failedMarketCap: number;
  failedIncome: number;
}> {
  let excludedByIndustry = 0;
  let failedFetch = 0;
  let failedMarketCap = 0;
  let failedIncome = 0;

  const tasks = NASDAQ_100.map(async (entry) => {
    const ex = isExcluded(entry.symbol);
    if (ex.excluded) {
      excludedByIndustry += 1;
      return null;
    }
    const result = await fetchBuffettData(entry);
    if (!result.metrics) {
      failedFetch += 1;
      return null;
    }
    if (
      result.marketCap == null ||
      result.marketCap < MARKET_CAP_MIN
    ) {
      failedMarketCap += 1;
      return null;
    }
    if (!result.has3yrPositiveIncome) {
      failedIncome += 1;
      return null;
    }
    return result.metrics;
  });

  const settled = await Promise.allSettled(tasks);
  const ok: BuffettMetrics[] = [];
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value) ok.push(s.value);
  }
  return { ok, excludedByIndustry, failedFetch, failedMarketCap, failedIncome };
}

function sortByMoS(items: BuffettMetrics[]): BuffettMetrics[] {
  return [...items].sort((a, b) => {
    const am = a.marginOfSafety ?? Number.POSITIVE_INFINITY;
    const bm = b.marginOfSafety ?? Number.POSITIVE_INFINITY;
    return am - bm; // more negative (deeper discount) first
  });
}

async function attachMemos(
  entries: BuffettMetrics[],
): Promise<BuffettMetrics[]> {
  if (entries.length === 0) return entries;
  try {
    const symbols = entries.map((e) => e.symbol);
    const news = await fetchNewsForTickers(symbols);
    const newsBySymbol = new Map(news.map((n) => [n.symbol, n]));

    const contexts: TickerContext[] = entries.map((m) => ({
      quant: {
        symbol: m.symbol,
        rs: 0,
        ma50Dist: 0,
        drawdown: m.marginOfSafety != null ? m.marginOfSafety * 100 : 0,
        revision: "NEUTRAL",
        action: "Wait",
        change1D: m.change1D,
      },
      news: newsBySymbol.get(m.symbol) ?? {
        symbol: m.symbol,
        headlines: [],
      },
    }));

    const memos = await generateMemosFromContexts(contexts);
    return entries.map((m) => ({
      ...m,
      memo: memos[m.symbol],
    })) as BuffettMetrics[];
  } catch (error) {
    console.warn("[buffett] memo generation failed:", error);
    return entries;
  }
}

export async function generateBuffettOpp(): Promise<BuffettOppBundle> {
  const universeSize = NASDAQ_100.length;
  const {
    ok,
    excludedByIndustry,
    failedFetch,
    failedMarketCap,
    failedIncome,
  } = await fetchAllBuffett();

  const sorted = sortByMoS(ok);
  const withMemos = await attachMemos(sorted);
  const picks = withMemos.filter((e) => e.pick.all).length;

  return {
    entries: withMemos,
    generatedAt: new Date().toISOString(),
    stats: {
      universeSize,
      excludedByIndustry,
      failedFetch,
      failedMarketCap,
      failedIncome,
      eligible: withMemos.length,
      picks,
    },
  };
}
