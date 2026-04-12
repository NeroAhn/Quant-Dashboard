import yahooFinance from "./client";
import { calculateRS, calculateMA50Dist, calculateDrawdown } from "@/lib/quant/engine";
import { getDecisionAction } from "@/lib/quant/signals";
import type { Revision } from "@/lib/quant/types";
import type { WatchlistItem } from "@/types/dashboard";

/**
 * EPS Revision 판정 (D-06).
 * earningsTrend의 현재분기(0q)와 다음분기(+1q) EPS 추정치 비교.
 * earningsTrend 없거나 빈 응답 -> "NEUTRAL" 반환 (Pitfall 4 대응).
 */
export function deriveRevision(
  earningsTrend:
    | {
        trend?: Array<{
          growth?: number | null;
          earningsEstimate?: {
            avg?: number | null;
          } | null;
          period?: string;
        }>;
      }
    | undefined
    | null
): Revision {
  if (!earningsTrend?.trend || earningsTrend.trend.length === 0) return "NEUTRAL";

  const currentQ = earningsTrend.trend.find((t) => t.period === "0q");
  const nextQ = earningsTrend.trend.find((t) => t.period === "+1q");

  if (!currentQ?.earningsEstimate?.avg || !nextQ?.earningsEstimate?.avg) return "NEUTRAL";

  const diff = nextQ.earningsEstimate.avg - currentQ.earningsEstimate.avg;
  const THRESHOLD = 0.01; // 1센트 이상 변화 시 방향 판정

  if (diff > THRESHOLD) return "UP";
  if (diff < -THRESHOLD) return "DOWN";
  return "NEUTRAL";
}

/**
 * 단일 종목 데이터 fetch + 퀀트 계산 + 시그널 판정.
 * quote() + quoteSummary(earningsTrend) 호출 후 서버에서 계산 (D-03).
 */
export async function fetchTickerData(
  symbol: string,
  spChangePercent: number
): Promise<WatchlistItem> {
  const [quote, summary] = await Promise.all([
    yahooFinance.quote(symbol),
    yahooFinance
      .quoteSummary(symbol, { modules: ["earningsTrend"] })
      .catch(() => ({ earningsTrend: undefined })),
  ]);

  const price = quote.regularMarketPrice ?? null;
  const change1D = quote.regularMarketChangePercent ?? null;
  const high52w = quote.fiftyTwoWeekHigh ?? null;
  const ma50 = quote.fiftyDayAverage ?? 0;
  const forwardPE = quote.forwardPE ?? null;

  const rs = calculateRS(change1D ?? 0, spChangePercent);
  const ma50Dist = calculateMA50Dist(price ?? 0, ma50);
  const drawdown = calculateDrawdown(price ?? 0, high52w ?? 0);
  const revision = deriveRevision(
    summary.earningsTrend as Parameters<typeof deriveRevision>[0]
  );
  const action = getDecisionAction(rs, ma50Dist, revision);

  return {
    symbol,
    price,
    change1D,
    high52w,
    forwardPE,
    rs,
    ma50Dist,
    drawdown,
    revision,
    action,
  };
}

/**
 * 종목 리스트에 대해 병렬 fetch + 부분 실패 허용 (D-02).
 * Promise.allSettled로 개별 종목 실패 격리.
 * T-02-02: Yahoo Finance 원본 에러 메시지를 그대로 노출하지 않음.
 */
export async function buildTickerResponse(
  tickers: readonly string[],
  spChangePercent: number
): Promise<(WatchlistItem | { symbol: string; error: string })[]> {
  const results = await Promise.allSettled(
    tickers.map((symbol) => fetchTickerData(symbol, spChangePercent))
  );

  return results.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    // T-02-02: generic error message, do not expose Yahoo Finance internals
    console.error(`[${tickers[i]}] fetch failed:`, result.reason);
    return { symbol: tickers[i], error: "Failed to fetch data" };
  });
}
