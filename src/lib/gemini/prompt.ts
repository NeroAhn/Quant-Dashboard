import type {
  WatchlistItem,
  MarketDataItem,
  FearGreedData,
} from "@/types/dashboard";

export interface AggregatedData {
  market: MarketDataItem[];
  fearGreed: FearGreedData | null;
  watchlist: WatchlistItem[];
  monitoring: WatchlistItem[];
  thresholdBreaches: {
    yield: boolean;
    dxy: boolean;
    fear: boolean;
  };
}

export const SYSTEM_INSTRUCTION = `당신은 18년 경력의 시니어 매크로 전략가입니다.
주어진 시장 데이터를 분석하여 정확히 3줄의 Executive Summary를 작성합니다.

규칙:
- 반드시 아래 형식을 따릅니다:
  1. [Macro] (매크로 환경 분석)
  2. [Quant] (퀀트 시그널 해석)
  3. [Market Implication] (시장 함의 및 액션)
- 한국어로 작성합니다
- 금융 전문 용어(RS, Drawdown, MA50, P/E 등)는 영어 그대로 사용합니다
- 간결하고 단정적인 전문가 어조로 작성합니다
- 각 줄은 1-2문장으로 제한합니다
- actionable 인사이트를 포함합니다`;

export function buildUserPrompt(data: AggregatedData): string {
  const marketLines = data.market
    .map((m) => {
      const pct =
        m.changePercent !== null ? ` (${m.changePercent.toFixed(2)}%)` : "";
      const priceStr = m.price !== null ? m.price.toLocaleString() : "N/A";
      return `- ${m.name}: ${priceStr}${pct}`;
    })
    .join("\n");

  const fearGreedLine = data.fearGreed
    ? `- Fear & Greed: ${data.fearGreed.display}`
    : "- Fear & Greed: N/A";

  const thresholdLines = [
    `- 10Y Yield > 4.5%: ${data.thresholdBreaches.yield ? "BREACH" : "OK"}`,
    `- DXY > 106.0: ${data.thresholdBreaches.dxy ? "BREACH" : "OK"}`,
    `- Fear & Greed <= 30: ${data.thresholdBreaches.fear ? "BREACH" : "OK"}`,
  ].join("\n");

  const watchlistLines = data.watchlist
    .map(
      (w) =>
        `- ${w.symbol}: RS=${w.rs.toFixed(1)}, MA50 Dist=${w.ma50Dist.toFixed(1)}%, DD=${w.drawdown.toFixed(1)}%, Action=${w.action}`
    )
    .join("\n");

  const monitoringLines = data.monitoring
    .map(
      (m) =>
        `- ${m.symbol}: RS=${m.rs.toFixed(1)}, MA50 Dist=${m.ma50Dist.toFixed(1)}%, DD=${m.drawdown.toFixed(1)}%, Action=${m.action}`
    )
    .join("\n");

  return `## Market Snapshot
${marketLines}
${fearGreedLine}

## Macro Threshold Status
${thresholdLines}

## Watchlist Top Signals (12 stocks)
${watchlistLines}

## Monitoring Top Signals (9 stocks)
${monitoringLines}

위 데이터를 기반으로 3-Line Executive Summary를 작성해주세요.`;
}
