import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo-finance/client";
import { buildTickerResponse } from "@/lib/yahoo-finance/quotes";
import { MONITORING_TICKERS } from "@/lib/constants";
import type { WatchlistResponse } from "@/types/dashboard";

/**
 * GET /api/monitoring
 * 9개 Monitoring 종목 데이터 + 퀀트 메트릭 + 액션 시그널 반환.
 * D-01: 독립 엔드포인트. D-02: 부분 실패 허용. D-03: 서버사이드 계산.
 */
export async function GET(): Promise<NextResponse<WatchlistResponse | { error: string }>> {
  try {
    // S&P 500 데이터 먼저 fetch (RS 계산 기준값)
    const spQuote = await yahooFinance.quote("^GSPC");
    const spChangePercent = spQuote.regularMarketChangePercent ?? 0;

    // 9개 종목 병렬 fetch + 퀀트 계산
    const data = await buildTickerResponse(MONITORING_TICKERS, spChangePercent);

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // T-02-02: generic error, no Yahoo Finance internals exposed
    console.error("[/api/monitoring] critical failure:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitoring data" },
      { status: 500 }
    );
  }
}
