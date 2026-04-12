import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo-finance/client";
import { MARKET_SYMBOLS } from "@/lib/constants";
import { fetchFearGreedIndex } from "@/lib/fear-greed/client";
import type { MarketDataItem, MarketDataResponse } from "@/types/dashboard";

/**
 * GET /api/market-data
 * 6개 시장 지표(S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY) + Fear & Greed Index 반환.
 * D-01: 독립 엔드포인트. D-02: 개별 지표 실패 허용. D-04: 병렬 fetch.
 */
export async function GET(): Promise<NextResponse<MarketDataResponse | { error: string }>> {
  try {
    // D-04: Fear & Greed and market symbols fetched in parallel
    const [marketResults, fearGreed] = await Promise.all([
      fetchMarketSymbols(),
      fetchFearGreedIndex(),
    ]);

    const response: MarketDataResponse = {
      data: marketResults,
      fearGreed,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    // T-03-03: Generic error message to client, details to server logs only
    console.error("[/api/market-data] critical failure:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}

async function fetchMarketSymbols(): Promise<MarketDataItem[]> {
  const entries = Object.entries(MARKET_SYMBOLS) as [string, string][];

  // D-02: Promise.allSettled for partial failure tolerance per symbol
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
