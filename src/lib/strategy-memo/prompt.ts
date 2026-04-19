import type { WatchlistItem } from "@/types/dashboard";
import type { TickerNews } from "@/lib/news/client";

export interface TickerContext {
  quant: Pick<
    WatchlistItem,
    "symbol" | "rs" | "ma50Dist" | "drawdown" | "revision" | "action" | "change1D"
  >;
  news: TickerNews;
}

export const STRATEGY_MEMO_SYSTEM_INSTRUCTION = `당신은 18년 경력의 시니어 매크로·섹터 애널리스트입니다.
주어진 종목의 퀀트 지표와 최근 뉴스 헤드라인을 분석하여, 각 종목에 대해 "전략 메모"를 작성합니다.

각 전략 메모 구조:
1. Root Cause: 최근 주가/지표 움직임의 원인을 뉴스와 퀀트 시그널을 결합해 간결히 설명
2. Forward Outlook: 향후 주시할 catalyst 또는 리스크를 1개 제시하며 actionable 관점 포함

규칙:
- 반드시 아래 JSON 형식만 반환합니다. 다른 텍스트·마크다운 금지.
- 한국어로 작성합니다. 금융 용어(RS, MA50, Drawdown, EPS, P/E, catalyst 등)는 영어 그대로 사용합니다.
- 각 종목 메모는 1~2문장, 80자 이내로 간결하게 작성합니다.
- 뉴스 헤드라인이 비어있거나 근거가 부족하면 "최근 특이 이슈 없음. [퀀트 지표 해석]" 형식으로 퀀트만 근거로 작성합니다.
- 추측은 금지. 데이터로 확인 불가한 내용은 단정하지 않습니다.
- 투자 권유 표현("매수하세요" 등)은 사용하지 않고, 시그널 해석과 관찰 포인트만 제시합니다.

반환 형식:
{
  "memos": [
    { "symbol": "AAPL", "memo": "..." },
    ...
  ]
}`;

export function buildStrategyMemoPrompt(contexts: TickerContext[]): string {
  const lines = contexts.map((ctx) => {
    const q = ctx.quant;
    const change1D = q.change1D != null ? `${q.change1D.toFixed(2)}%` : "N/A";
    const quantLine = `${q.symbol}: RS=${q.rs.toFixed(1)}, MA50=${q.ma50Dist.toFixed(1)}%, DD=${q.drawdown.toFixed(1)}%, 1D=${change1D}, Revision=${q.revision}, Action=${q.action}`;

    const newsBlock =
      ctx.news.headlines.length > 0
        ? ctx.news.headlines
            .map((h) => `  - [${h.publisher}] ${h.title}`)
            .join("\n")
        : "  - (최근 7일 내 뉴스 없음)";

    return `## ${q.symbol}\nQuant: ${quantLine}\nNews:\n${newsBlock}`;
  });

  return `다음 ${contexts.length}개 종목 각각에 대해 "전략 메모"를 작성하세요.

${lines.join("\n\n")}

위 데이터를 기반으로 각 종목에 대해 Root Cause + Forward Outlook을 결합한 간결한 전략 메모를 JSON으로 반환하세요.`;
}
