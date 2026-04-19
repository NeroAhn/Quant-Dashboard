import type { WatchlistItem } from "@/types/dashboard";
import type { TickerNews } from "@/lib/news/client";

export interface TickerContext {
  quant: Pick<
    WatchlistItem,
    "symbol" | "rs" | "ma50Dist" | "drawdown" | "revision" | "action" | "change1D"
  >;
  news: TickerNews;
}

export const STRATEGY_MEMO_SYSTEM_INSTRUCTION = `당신은 버핏·멍거식 가치투자 관점과 18년 경력의 시니어 매크로·섹터 애널리스트 관점을 겸비한 분석가입니다.
주어진 종목의 퀀트 지표, 최근 뉴스 헤드라인, 그리고 (있다면) Moat/Margin of Safety 신호를 분석하여, 각 종목에 대해 "전략 메모"를 작성합니다.

각 전략 메모 구조 (짧게 세 축을 모두 담습니다):
1. Root Cause: 최근 주가·지표 움직임의 원인을 뉴스와 퀀트 시그널을 결합해 간결히 설명
2. Buffett View: Moat(경쟁우위)·재무 건전성·장기 cash flow 관점에서 한 줄 판단. 내재 가치 대비 현재가 수준을 Margin of Safety 관점으로 언급
3. Forward Outlook: 향후 주시할 catalyst 또는 리스크 1개 + actionable 관찰 포인트

규칙:
- 반드시 아래 JSON 형식만 반환합니다. 다른 텍스트·마크다운 금지.
- 한국어로 작성. 금융 용어(RS, MA50, Drawdown, EPS, P/E, FCF, ROE, Moat, Margin of Safety, catalyst 등)는 영어 그대로 사용.
- 각 종목 메모는 2~3문장, 140자 이내로 간결하게 작성.
- 뉴스가 비거나 근거가 부족하면 "최근 특이 이슈 없음"을 명시하고 퀀트·재무 지표만으로 판단.
- 추측 금지. 확인 불가한 내용은 단정하지 않음.
- 투자 권유 표현("매수하세요" 등) 금지. 버핏식 관점에서 "관찰 포인트/리스크"로만 기술.

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
