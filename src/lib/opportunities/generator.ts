import yahooFinance from "@/lib/yahoo-finance/client";
import { calculateDrawdown } from "@/lib/quant/engine";
import { fetchNewsForTickers } from "@/lib/news/client";
import { generateMemosFromContexts } from "@/lib/strategy-memo/engine";
import type { TickerContext } from "@/lib/strategy-memo/prompt";
import {
  NASDAQ_UNIVERSE_SYMBOLS,
  SECTOR_BY_SYMBOL,
  type BroadSector,
} from "./universe";
import {
  applySectorCap,
  passesFilter,
  scoreAndRank,
  type OpportunityCandidate,
  type OpportunityRanked,
} from "./scorer";

export interface OpportunityEntry {
  symbol: string;
  sector: BroadSector;
  price: number;
  change1D: number | null;
  high52w: number;
  drawdown: number;
  forwardPE: number;
  marketCap: number;
  oppScore: number;
  rank: number;
  memo?: string;
}

export interface OpportunityBundle {
  opportunities: OpportunityEntry[];
  generatedAt: string;
  universeSize: number;
  eligibleCount: number;
}

async function fetchCandidates(
  symbols: readonly string[],
): Promise<OpportunityCandidate[]> {
  const results = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const quote = await yahooFinance.quote(symbol);
      return { symbol, quote };
    }),
  );

  const candidates: OpportunityCandidate[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    const { symbol, quote } = r.value;
    const sector = SECTOR_BY_SYMBOL[symbol];
    if (!sector) continue;

    const price = quote.regularMarketPrice ?? null;
    const high52w = quote.fiftyTwoWeekHigh ?? null;
    const forwardPE = quote.forwardPE ?? null;
    const marketCap = quote.marketCap ?? null;
    const change1D = quote.regularMarketChangePercent ?? null;

    if (price == null || high52w == null) continue;
    const drawdown = calculateDrawdown(price, high52w);

    if (!passesFilter({ drawdown, forwardPE, marketCap })) continue;

    candidates.push({
      symbol,
      sector,
      price,
      change1D,
      high52w,
      drawdown,
      forwardPE: forwardPE!,
      marketCap: marketCap!,
    });
  }
  return candidates;
}

export async function generateOpportunities(): Promise<OpportunityBundle> {
  const candidates = await fetchCandidates(NASDAQ_UNIVERSE_SYMBOLS);
  const ranked = scoreAndRank(candidates);
  const top = applySectorCap(ranked);

  let memos: Record<string, string> = {};
  if (top.length > 0) {
    try {
      const topSymbols = top.map((t) => t.symbol);
      const news = await fetchNewsForTickers(topSymbols);
      const newsBySymbol = new Map(news.map((n) => [n.symbol, n]));

      const contexts: TickerContext[] = top.map((t) => ({
        quant: {
          symbol: t.symbol,
          rs: 0,
          ma50Dist: 0,
          drawdown: t.drawdown,
          revision: "NEUTRAL",
          action: "Wait",
          change1D: t.change1D,
        },
        news: newsBySymbol.get(t.symbol) ?? {
          symbol: t.symbol,
          headlines: [],
        },
      }));
      memos = await generateMemosFromContexts(contexts);
    } catch (error) {
      console.warn("[opportunities] memo generation failed:", error);
      memos = {};
    }
  }

  const opportunities: OpportunityEntry[] = top.map((t, i) => ({
    symbol: t.symbol,
    sector: t.sector,
    price: t.price,
    change1D: t.change1D,
    high52w: t.high52w,
    drawdown: t.drawdown,
    forwardPE: t.forwardPE,
    marketCap: t.marketCap,
    oppScore: Number(t.oppScore.toFixed(1)),
    rank: i + 1,
    memo: memos[t.symbol],
  }));

  return {
    opportunities,
    generatedAt: new Date().toISOString(),
    universeSize: NASDAQ_UNIVERSE_SYMBOLS.length,
    eligibleCount: ranked.length,
  };
}

export type { OpportunityRanked };
