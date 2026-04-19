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
  memoError?: string;
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

const MEMO_TOP_N = 30;

async function attachMemos(
  entries: BuffettMetrics[],
): Promise<{ entries: BuffettMetrics[]; error?: string }> {
  if (entries.length === 0) return { entries };
  // Only generate memos for the top-N (highest MoS discount) to fit
  // within Gemini's single-call output-token budget.
  const memoTargets = entries.slice(0, MEMO_TOP_N);
  try {
    const symbols = memoTargets.map((e) => e.symbol);
    const news = await fetchNewsForTickers(symbols);
    const newsBySymbol = new Map(news.map((n) => [n.symbol, n]));

    const contexts: TickerContext[] = memoTargets.map((m) => ({
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
    const memoCount = Object.keys(memos).length;
    const result = entries.map((m) => ({
      ...m,
      memo: memos[m.symbol],
    })) as BuffettMetrics[];
    if (memoCount === 0) {
      return { entries: result, error: "gemini returned 0 memos" };
    }
    return { entries: result };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn("[buffett] memo generation failed:", msg);
    return { entries, error: msg };
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
  const { entries: withMemos, error: memoError } = await attachMemos(sorted);
  const picks = withMemos.filter((e) => e.pick.all).length;

  return {
    entries: withMemos,
    generatedAt: new Date().toISOString(),
    memoError,
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
