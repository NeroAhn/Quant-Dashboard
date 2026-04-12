# Phase 1: Foundation & Data Pipeline - Research

**Researched:** 2026-04-12
**Domain:** Next.js App Router + Yahoo Finance API + Quant Engine + TanStack Query Polling
**Confidence:** HIGH

## Summary

Phase 1은 그린필드 프로젝트의 기반을 구축한다. Next.js 15 App Router 기반 프로젝트를 셋업하고, yahoo-finance2 라이브러리를 사용하여 서버사이드 Route Handler에서 Yahoo Finance 데이터를 프록시한다. 퀀트 엔진(RS, MA50 이격도, Drawdown)을 순수 함수로 구현하고, 액션 시그널(Buy/Hold/Wait/Trim)을 기계적으로 생성한다. 클라이언트에서는 TanStack Query로 5분 자동 갱신 파이프라인을 구축한다.

**중요 환경 이슈:** 현재 시스템에 Node.js 12.11.1만 설치되어 있으며, Next.js 15는 Node.js >= 18.18.0을 요구한다. nvs로 Node.js 20+ LTS 설치가 선행되어야 한다.

Fear & Greed Index는 feargreedchart.com의 무료 JSON API를 사용할 수 있다(API 키 불필요, CORS 허용). EPS Revision은 yahoo-finance2의 `quoteSummary({ modules: ['earningsTrend'] })`로 소싱 가능하다.

**Primary recommendation:** Node.js 20 LTS 설치 후, Next.js 15.5.x + yahoo-finance2 + TanStack Query v5 스택으로 3개 API Route Handler 구축. 퀀트 로직은 순수 함수로 분리하여 단위 테스트 가능하게 설계.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** API 엔드포인트 3개 분리: `/api/watchlist`, `/api/monitoring`, `/api/market-data`
- **D-02:** API 호출 실패 시 부분 반환 -- 성공한 종목은 정상, 실패한 종목은 null/에러 필드
- **D-03:** RS 등 퀀트 계산은 서버에서 처리. S&P 500 데이터 내부 공유
- **D-04:** Yahoo Finance API 호출은 3그룹 병렬
- **D-05:** Fear & Greed Index는 대체 무료 API 활용
- **D-06:** EPS Revision은 yahoo-finance2 `earningsTrend` 모듈 우선 시도
- **D-07:** Fear & Greed 표시: 숫자 + 텍스트 라벨 (`42 (Fear)`)
- **D-08:** Wait 조건은 OR 로직 -- `Revision DOWN || RS < 90` 중 하나만 충족해도 Wait
- **D-09:** RS 계산 시 변동% 기간은 1일(1D)
- **D-10:** MA50 데이터 소싱은 Claude 재량
- **D-11:** API 장애 시 stale 데이터 유지하지 않음, 에러 상태 전환
- **D-12:** 장 운영시간 5분 갱신, 장 마감 후 30분 간격. BTC/Gold/DXY 등 24시간 자산은 마감 후에도 갱신 지속

### Claude's Discretion
- MA50 데이터 소싱 방식 (D-10): `fiftyDayAverage` 필드 유무에 따라 판단
- 부동소수점 임계값 비교 시 epsilon 범위

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Yahoo Finance API로 21개 종목 실시간 시세 | yahoo-finance2 `quote()` 메서드로 전체 커버 가능. `regularMarketPrice`, `regularMarketChangePercent`, `fiftyTwoWeekHigh`, `fiftyDayAverage`, `forwardPE` 필드 확인됨 |
| DATA-02 | 5분 주기 자동 갱신 | TanStack Query `refetchInterval: 300_000` + `refetchIntervalInBackground: true` |
| DATA-03 | Market Snapshot 지표 (S&P500, NASDAQ, BTC, GOLD, 10Y, DXY) | yahoo-finance2 `quote()` -- 각 지수/자산 심볼: `^GSPC`, `^IXIC`, `BTC-USD`, `GC=F`, `^TNX`, `DX-Y.NYB` |
| DATA-04 | Fear & Greed Index | feargreedchart.com 무료 JSON API (API 키 불필요) |
| DATA-05 | 서버사이드 데이터 프록시 | Next.js App Router Route Handlers (`app/api/*/route.ts`) |
| DATA-06 | TanStack Query 클라이언트 캐싱/자동 갱신 | @tanstack/react-query v5 `useQuery` + `refetchInterval` |
| DATA-07 | Skeleton UI 로딩 상태 | TanStack Query `isPending` / `isLoading` 상태로 구현 |
| DATA-08 | 데이터 갱신 시각 표시 | TanStack Query `dataUpdatedAt` 타임스탬프 활용 |
| QENG-01 | RS 자동 계산 | 서버에서 종목 `regularMarketChangePercent` / S&P500 `regularMarketChangePercent` * 100 |
| QENG-02 | MA50 이격도 계산 | `fiftyDayAverage` 필드 활용 (quote()에서 확인됨) |
| QENG-03 | Drawdown 계산 | `fiftyTwoWeekHigh` 필드 활용 |
| QENG-04 | 부동소수점 임계값 비교 | epsilon = 1e-10 수준의 허용 오차 적용 |
| ASIG-01 | Buy 시그널: Revision UP + RS > 110 + MA50 Dist < 5% | 순수 함수로 구현, earningsTrend에서 Revision 판정 |
| ASIG-02 | Trim 시그널: RS > 130 + MA50 Dist > 12% | 순수 함수로 구현 |
| ASIG-03 | Wait 시그널: Revision DOWN OR RS < 90 | OR 로직 확정 (D-08) |
| ASIG-04 | Hold 시그널: 기타 조건 | 나머지 모든 경우 Hold |
| ASIG-05 | 시그널 색상 코딩 | Buy=Green, Trim=Red, Wait=Yellow, Hold=Gray -- 타입 정의에 포함 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech Stack 고정:** Next.js 15.x + Tailwind CSS v4 + Lucide-react + TanStack Query v5 + Zustand v5
- **yahoo-finance2 서버사이드 전용:** CORS/cookie 제약으로 브라우저에서 실행 불가. Next.js Route Handler 필수
- **@google/genai 사용 (Phase 3용):** `@google/generative-ai`는 deprecated -- 절대 사용 금지
- **Axios 사용 금지:** native `fetch` 사용
- **SWR 사용 금지:** TanStack Query 사용
- **Redux 사용 금지:** Zustand 사용
- **DaisyUI/Tailwind UI 사용 금지:** 유틸리티로 직접 구축
- **Recharts** 차트 라이브러리 (Phase 2에서 주로 사용)

## Standard Stack

### Core (Phase 1 설치)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.5.15 | Full-stack React framework | Vercel-native, App Router Route Handlers로 Yahoo Finance 프록시. 15.x 안정 라인 [VERIFIED: npm registry] |
| react / react-dom | 19.x | UI library | Next.js 15와 함께 설치됨 [VERIFIED: npm registry] |
| typescript | 5.x | Type safety | 퀀트 공식 타입 안전성 필수 [VERIFIED: npm registry] |
| yahoo-finance2 | 3.14.0 | Yahoo Finance 데이터 | 유일한 유지보수 Node.js YF 라이브러리 [VERIFIED: npm registry] |
| @tanstack/react-query | 5.99.0 | 서버 상태 관리/폴링 | refetchInterval + stale-while-revalidate [VERIFIED: npm registry] |
| zustand | 5.0.12 | 클라이언트 상태 | 탭, 필터, 정렬 상태 [VERIFIED: npm registry] |
| tailwindcss | 4.2.2 | 스타일링 | CSS-first config, v4 안정 [VERIFIED: npm registry] |
| lucide-react | 1.8.0 | 아이콘 | PRD 지정 [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query-devtools | 5.99.0 | 쿼리 디버깅 | 개발 중 폴링/캐시 상태 확인 [VERIFIED: npm registry] |

### Fear & Greed Index 데이터 소싱

npm 패키지 대신 **feargreedchart.com 무료 API** 사용을 권장한다. [VERIFIED: feargreedchart.com/api-docs]

- **Endpoint:** `https://feargreedchart.com/api/?action=all`
- **인증:** API 키 불필요
- **CORS:** 허용됨
- **캐싱:** 서버 15분 캐시 (우리 5분 갱신 주기와 호환)
- **반환 데이터:** 종합 공포/탐욕 점수(0-100), 5개 구성요소 상세, 텍스트 라벨

대안으로 CNN 공식 엔드포인트 `https://production.dataviz.cnn.io/index/fearandgreed/graphdata/{date}` 가 있으나 418 에러 발생 확인됨 -- 직접 사용 불가. [VERIFIED: WebFetch 테스트]

**Installation:**
```bash
# nvs로 Node.js 20 LTS 설치 후
nvs add 20
nvs use 20

# Next.js 프로젝트 생성
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install yahoo-finance2@^3.14.0 @tanstack/react-query@^5.99.0 zustand@^5.0.12 lucide-react@^1.8.0

# Dev dependencies
npm install -D @tanstack/react-query-devtools@^5.99.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── watchlist/
│   │   │   └── route.ts          # GET /api/watchlist (12 종목 + 퀀트 메트릭 + 시그널)
│   │   ├── monitoring/
│   │   │   └── route.ts          # GET /api/monitoring (9 종목 + 퀀트 메트릭 + 시그널)
│   │   └── market-data/
│   │       └── route.ts          # GET /api/market-data (지수 + Fear & Greed)
│   ├── layout.tsx                # QueryClientProvider + Zustand Provider-free
│   ├── page.tsx                  # 메인 대시보드 (Phase 2에서 탭 UI 구현)
│   └── providers.tsx             # QueryClient setup
├── lib/
│   ├── yahoo-finance/
│   │   ├── client.ts             # yahoo-finance2 인스턴스 + 공통 설정
│   │   ├── quotes.ts             # quote() 래퍼 함수 (에러 핸들링 포함)
│   │   └── types.ts              # Yahoo Finance 응답 타입 정의
│   ├── quant/
│   │   ├── engine.ts             # RS, MA50 Dist, Drawdown 순수 함수
│   │   ├── signals.ts            # 액션 시그널 판정 로직 (getDecisionAction)
│   │   └── types.ts              # QuantMetrics, ActionSignal 타입
│   ├── fear-greed/
│   │   └── client.ts             # feargreedchart.com API 클라이언트
│   └── constants.ts              # 종목 리스트, 심볼 매핑, 임계값 상수
├── hooks/
│   ├── use-watchlist.ts          # useQuery + /api/watchlist
│   ├── use-monitoring.ts         # useQuery + /api/monitoring
│   └── use-market-data.ts        # useQuery + /api/market-data
├── store/
│   └── dashboard.ts              # Zustand: activeTab, sortConfig, searchQuery
└── types/
    └── dashboard.ts              # 공유 타입 (WatchlistItem, MarketDataItem, etc.)
```

### Pattern 1: Server-Side Quant Computation with Partial Failure Handling

**What:** API Route Handler에서 yahoo-finance2로 데이터 fetch -> 퀀트 엔진으로 계산 -> 결과 반환. 개별 종목 실패 시 null 표시.
**When to use:** 모든 /api/* 엔드포인트

```typescript
// src/app/api/watchlist/route.ts
// Source: yahoo-finance2 GitHub docs + D-02 부분 반환 결정
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";
import { calculateRS, calculateMA50Dist, calculateDrawdown } from "@/lib/quant/engine";
import { getDecisionAction } from "@/lib/quant/signals";
import { WATCHLIST_TICKERS } from "@/lib/constants";

export async function GET() {
  try {
    // S&P 500 데이터 먼저 fetch (RS 계산에 필요)
    const spyQuote = await yahooFinance.quote("^GSPC");
    const spyChangePercent = spyQuote.regularMarketChangePercent ?? 0;

    // 종목별 병렬 fetch + 부분 실패 허용
    const results = await Promise.allSettled(
      WATCHLIST_TICKERS.map(async (symbol) => {
        const [quote, summary] = await Promise.all([
          yahooFinance.quote(symbol),
          yahooFinance.quoteSummary(symbol, { modules: ["earningsTrend"] }),
        ]);

        const rs = calculateRS(quote.regularMarketChangePercent ?? 0, spyChangePercent);
        const ma50Dist = calculateMA50Dist(quote.regularMarketPrice!, quote.fiftyDayAverage!);
        const drawdown = calculateDrawdown(quote.regularMarketPrice!, quote.fiftyTwoWeekHigh!);
        const revision = deriveRevision(summary.earningsTrend);
        const action = getDecisionAction(rs, ma50Dist, revision);

        return {
          symbol,
          price: quote.regularMarketPrice,
          change1D: quote.regularMarketChangePercent,
          high52w: quote.fiftyTwoWeekHigh,
          rs,
          ma50Dist,
          drawdown,
          revision,
          forwardPE: quote.forwardPE ?? null,
          action,
        };
      })
    );

    // 부분 반환: fulfilled -> 데이터, rejected -> null + 에러 메시지
    const data = results.map((result, i) => {
      if (result.status === "fulfilled") return result.value;
      return { symbol: WATCHLIST_TICKERS[i], error: result.reason?.message ?? "Unknown error" };
    });

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
```

### Pattern 2: Pure Quant Functions (Testable)

**What:** 퀀트 계산을 순수 함수로 분리하여 부작용 없이 테스트 가능
**When to use:** 모든 수치 계산

```typescript
// src/lib/quant/engine.ts
// Source: PROJECT.md 퀀트 공식

export function calculateRS(tickerChangePercent: number, spChangePercent: number): number {
  if (Math.abs(spChangePercent) < 1e-10) return 100; // S&P 변동 없을 때 기본값
  return (tickerChangePercent / spChangePercent) * 100;
}

export function calculateMA50Dist(currentPrice: number, ma50: number): number {
  if (Math.abs(ma50) < 1e-10) return 0;
  return ((currentPrice - ma50) / ma50) * 100;
}

export function calculateDrawdown(currentPrice: number, high52w: number): number {
  if (Math.abs(high52w) < 1e-10) return 0;
  return ((currentPrice - high52w) / high52w) * 100;
}
```

### Pattern 3: Action Signal Logic (OR-based Wait)

**What:** D-08 결정에 따른 OR 로직 Wait 시그널 판정
**When to use:** 액션 시그널 계산

```typescript
// src/lib/quant/signals.ts
// Source: D-08 (CONTEXT.md), 목업 코드의 getDecisionAction 기반

type Revision = "UP" | "DOWN" | "NEUTRAL";
type ActionSignal = "Buy" | "Trim" | "Wait" | "Hold";

const EPSILON = 1e-10;

function gt(a: number, b: number): boolean { return a - b > EPSILON; }
function lt(a: number, b: number): boolean { return b - a > EPSILON; }

export function getDecisionAction(
  rs: number,
  ma50Dist: number,
  revision: Revision
): ActionSignal {
  // Trim: RS > 130 + MA50 Dist > 12% (과열 - 가장 먼저 체크)
  if (gt(rs, 130) && gt(ma50Dist, 12)) return "Trim";

  // Buy: Revision UP + RS > 110 + MA50 Dist < 5% (퀄리티 딥)
  if (revision === "UP" && gt(rs, 110) && lt(ma50Dist, 5)) return "Buy";

  // Wait: Revision DOWN || RS < 90 (약세 - OR 로직, D-08)
  if (revision === "DOWN" || lt(rs, 90)) return "Wait";

  // Hold: 나머지 전부
  return "Hold";
}
```

### Pattern 4: TanStack Query with Conditional Polling

**What:** 장 운영 시간에 따라 갱신 주기 조절 (D-12)
**When to use:** 클라이언트 훅

```typescript
// src/hooks/use-watchlist.ts
import { useQuery } from "@tanstack/react-query";
import type { WatchlistResponse } from "@/types/dashboard";

function getRefetchInterval(): number | false {
  const now = new Date();
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const hour = et.getHours();
  const minute = et.getMinutes();
  const day = et.getDay();

  // 주말
  if (day === 0 || day === 6) return 30 * 60 * 1000; // 30분

  // 장 운영시간 (ET 9:30-16:00)
  const marketOpen = hour > 9 || (hour === 9 && minute >= 30);
  const marketClose = hour < 16;

  if (marketOpen && marketClose) return 5 * 60 * 1000; // 5분
  return 30 * 60 * 1000; // 장 마감 후 30분
}

export function useWatchlist() {
  return useQuery<WatchlistResponse>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error("Failed to fetch watchlist");
      return res.json();
    },
    refetchInterval: getRefetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 4 * 60 * 1000, // 4분 (5분 갱신 직전까지 fresh)
  });
}
```

### Pattern 5: EPS Revision Derivation from earningsTrend

**What:** yahoo-finance2 earningsTrend 모듈에서 EPS 추정치 변화를 추출하여 Revision 판정
**When to use:** D-06에 따른 EPS Revision 소싱

```typescript
// src/lib/yahoo-finance/quotes.ts
// Source: yahoo-finance2 quoteSummary earningsTrend module [VERIFIED: GitHub source]

import type { EarningsTrend } from "yahoo-finance2/dist/esm/src/modules/quoteSummary-iface";

type Revision = "UP" | "DOWN" | "NEUTRAL";

export function deriveRevision(earningsTrend: { trend?: Array<{
  growth?: number | null;
  earningsEstimate?: {
    avg?: number | null;
  } | null;
  period?: string;
}> } | undefined): Revision {
  if (!earningsTrend?.trend || earningsTrend.trend.length === 0) return "NEUTRAL";

  // 현재 분기(0q)와 다음 분기(+1q) 추정치 비교
  const currentQ = earningsTrend.trend.find(t => t.period === "0q");
  const nextQ = earningsTrend.trend.find(t => t.period === "+1q");

  if (!currentQ?.earningsEstimate?.avg || !nextQ?.earningsEstimate?.avg) return "NEUTRAL";

  const diff = nextQ.earningsEstimate.avg - currentQ.earningsEstimate.avg;
  const THRESHOLD = 0.01; // 1센트 이상 변화 시 방향 판정

  if (diff > THRESHOLD) return "UP";
  if (diff < -THRESHOLD) return "DOWN";
  return "NEUTRAL";
}
```

### Anti-Patterns to Avoid
- **클라이언트에서 yahoo-finance2 직접 호출:** CORS 차단됨. 반드시 Route Handler 프록시 사용
- **모든 종목 순차 fetch:** Promise.allSettled로 병렬 처리 필수
- **stale 데이터 캐싱 유지 (D-11 위반):** API 실패 시 이전 데이터 표시하지 않음. `gcTime` 짧게 설정하거나 에러 시 명시적으로 stale 제거
- **부동소수점 직접 비교:** `rs > 110` 대신 epsilon 포함 비교 함수 사용 (QENG-04)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Yahoo Finance 데이터 fetch | 직접 HTTP 호출 + 파싱 | yahoo-finance2 | 쿠키 핸들링, 응답 파싱, 타입 정의 내장 |
| 데이터 자동 갱신 | setInterval + useState | TanStack Query refetchInterval | 백그라운드 갱신, 에러 재시도, 캐시 무효화 내장 |
| 서버 상태 캐싱 | 수동 캐시 레이어 | TanStack Query | stale-while-revalidate, 쿼리 키 기반 캐시 |
| 클라이언트 전역 상태 | React Context + useReducer | Zustand | 리렌더 최적화, 미들웨어 (persist), 셀렉터 |

## Common Pitfalls

### Pitfall 1: Node.js 버전 호환성
**What goes wrong:** Next.js 15는 Node.js >= 18.18.0 필요. 현재 환경 Node.js 12.11.1.
**Why it happens:** nvs에 구버전만 설치됨.
**How to avoid:** Wave 0에서 `nvs add 20 && nvs use 20 && nvs link 20` 실행하여 Node.js 20 LTS를 기본으로 설정.
**Warning signs:** `npx create-next-app` 실행 시 엔진 호환성 에러.

### Pitfall 2: yahoo-finance2 Rate Limiting
**What goes wrong:** Yahoo Finance가 너무 많은 호출에 429 또는 빈 응답 반환.
**Why it happens:** 21개 종목 + 7개 지표를 동시에 호출하면 단기간에 28+회 API 호출.
**How to avoid:** (1) `quote()` 메서드는 배열 입력 지원 -- `quote(['AAPL', 'GOOGL', ...])` 단일 호출로 다수 종목 조회. (2) Route Handler 레벨에서 응답 캐싱 (Cache-Control 또는 메모리 캐시).
**Warning signs:** 간헐적 빈 응답, 일부 종목 데이터 누락.

### Pitfall 3: S&P 500 변동률이 0일 때 RS 계산 Division by Zero
**What goes wrong:** 장 시작 직후나 공휴일에 S&P 500 변동률이 0이면 RS가 Infinity/NaN.
**Why it happens:** RS = ticker% / spy% * 100에서 분모가 0.
**How to avoid:** spChangePercent가 0에 가까우면 RS = 100 (중립) 반환. epsilon 비교 사용.
**Warning signs:** 장 시작 직후 RS 값이 극단적.

### Pitfall 4: earningsTrend 모듈이 일부 종목에서 빈 응답
**What goes wrong:** 소형주나 특수 종목(IONQ, OKLO 등)은 earningsTrend 데이터가 없을 수 있음.
**Why it happens:** Yahoo Finance 커버리지 한계.
**How to avoid:** earningsTrend 실패 또는 빈 응답 시 Revision = "NEUTRAL" 기본값. D-06 결정과 일치.
**Warning signs:** quoteSummary 호출 시 빈 객체 또는 에러.

### Pitfall 5: TanStack Query staleTime과 refetchInterval 상호작용
**What goes wrong:** staleTime > refetchInterval이면 백그라운드 리패치가 무시될 수 있음.
**Why it happens:** staleTime 동안 데이터가 "fresh"로 간주되어 리패치 트리거 안 됨. 다만 refetchInterval은 staleTime과 독립적으로 작동함 (STATE.md에 TanStack Query Issue #7721 언급됨).
**How to avoid:** staleTime을 refetchInterval보다 짧게 설정 (4분 vs 5분). 또는 동일하게 설정.
**Warning signs:** 데이터가 예상보다 오래됨, dataUpdatedAt이 갱신 안 됨.

### Pitfall 6: feargreedchart.com API 의존성
**What goes wrong:** 서드파티 무료 API가 다운되거나 구조 변경.
**Why it happens:** 비공식 API, SLA 없음.
**How to avoid:** Fear & Greed fetch 실패 시 null 반환하고 UI에서 "N/A" 표시. CNN 공식 엔드포인트를 폴백으로 시도하되, 418 발생할 수 있음.
**Warning signs:** API 응답 구조 변경, 타임아웃 빈번.

## Code Examples

### Yahoo Finance 심볼 매핑 (Market Data)

```typescript
// src/lib/constants.ts
// Source: Yahoo Finance symbol conventions [ASSUMED - 일반적 Yahoo Finance 심볼]

export const WATCHLIST_TICKERS = [
  "AAPL", "GOOGL", "META", "MSFT", "NVDA", "TSLA",
  "PLTR", "IONQ", "OKLO", "OXY", "V", "UNH",
] as const;

export const MONITORING_TICKERS = [
  "MU", "AMZN", "NFLX", "CEG", "SO", "NEE", "BRK-B", "LLY", "JNJ",
] as const;

// Market Data 심볼 매핑
export const MARKET_SYMBOLS = {
  "S&P 500": "^GSPC",
  "NASDAQ": "^IXIC",
  "BTC": "BTC-USD",
  "GOLD": "GC=F",
  "10Y Yield": "^TNX",
  "DXY": "DX-Y.NYB",
} as const;

// Note: BRK.B -> BRK-B (yahoo-finance2에서 마침표 대신 하이픈 사용)
```

### QueryClient 설정

```typescript
// src/app/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // D-11: 에러 시 stale 데이터 유지하지 않음
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // gcTime을 짧게 -- 에러 후 캐시 빠르게 제거
        gcTime: 10 * 60 * 1000, // 10분
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 배치 quote() 호출 (Rate Limiting 대응)

```typescript
// src/lib/yahoo-finance/quotes.ts
import yahooFinance from "yahoo-finance2";

// yahoo-finance2 quote()는 배열 심볼을 지원하여 단일 HTTP 호출로 다수 조회
export async function batchQuote(symbols: readonly string[]) {
  const results = await yahooFinance.quote(symbols as string[]);
  // 배열로 반환됨 -- 심볼별 매핑
  return Array.isArray(results) ? results : [results];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` | `@google/genai` | 2025년 5월 GA | Phase 3에서 사용. 구 패키지 EOL 2025-08 |
| Next.js Pages Router `/pages/api/` | App Router `app/api/route.ts` | Next.js 13+ | Route Handler 패턴 사용 |
| TanStack Query v4 | v5 | 2023 | 새 API, 타입 개선, 폴링 향상 |
| Tailwind v3 (JS config) | v4 (CSS-first config) | 2025-01 | `@import "tailwindcss"` -- tailwind.config.js 불필요 |
| Zustand v4 | v5 | 2024 | `useSyncExternalStore` 네이티브, React 18+ 전용 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | BRK.B의 yahoo-finance2 심볼이 "BRK-B"이다 | Code Examples | 심볼 조회 실패 -- 실제 테스트 필요 |
| A2 | feargreedchart.com API가 안정적으로 작동한다 | Standard Stack | Fear & Greed 데이터 소싱 실패 -- CNN 대안 또는 하드코딩 폴백 필요 |
| A3 | yahoo-finance2 `quote()`가 배열 심볼을 단일 HTTP로 배치 처리한다 | Code Examples | 배치 미지원 시 개별 호출 필요 -- rate limit 압박 증가 |
| A4 | earningsTrend의 period "0q"/"1q" 패턴으로 Revision 판정 가능 | Architecture Patterns | 실제 응답 구조가 다를 수 있음 -- 첫 구현 시 실제 응답 로깅 후 조정 필요 |
| A5 | DX-Y.NYB가 DXY(달러인덱스)의 Yahoo Finance 심볼이다 | Code Examples | 심볼 오류 시 데이터 조회 실패 |

## Open Questions (RESOLVED)

1. **earningsTrend 실제 응답 구조** — RESOLVED: Plan 01-02 Task 2에서 `deriveRevision()` 함수가 earningsTrend null/undefined 시 NEUTRAL 폴백 처리. 런타임 로깅으로 구조 확인 후 로직 확정.
   - What we know: `earningsTrend` 모듈이 존재하며 trend 배열 포함
   - What's unclear: period 필드의 정확한 값, EPS 추정치 변화를 Revision UP/DOWN으로 변환하는 최적 로직
   - Recommendation: 첫 구현 시 AAPL 등 대형주로 실제 응답을 로깅하여 구조 확인 후 로직 확정

2. **feargreedchart.com API 응답 안정성** — RESOLVED: Plan 01-03 Task 1에서 timeout 보호 + null 폴백 + score 범위 검증 구현. 서버사이드 캐싱 포함.
   - What we know: 문서화된 무료 API, CORS 허용, 15분 캐시
   - What's unclear: 장기 안정성, 서비스 중단 빈도
   - Recommendation: 서버 사이드에서 호출하고 자체 캐싱 레이어 추가. 실패 시 null 반환

3. **24시간 자산 갱신 로직 (D-12)** — RESOLVED: Plan 01-04 Task 1에서 market-data 훅은 항상 5분, watchlist/monitoring 훅은 장 운영시간에 따라 조건부 갱신 주기 적용.
   - What we know: BTC, GOLD, DXY는 장 마감 후에도 갱신 필요
   - What's unclear: 3개 API 엔드포인트가 분리되어 있어 market-data만 별도 갱신 주기 적용이 자연스러움
   - Recommendation: `/api/market-data` 훅은 항상 5분 갱신, `/api/watchlist`와 `/api/monitoring` 훅만 장 시간에 따라 주기 조절

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js >= 18.18 | Next.js 15 | **MISSING** | 12.11.1 | nvs add 20 && nvs use 20 |
| npm | Package management | Available | 6.11.3 (Node 12 bundled) | Node 20 설치 시 자동 업그레이드 |
| nvs | Node version management | Available | - | -- |
| git | Version control | Not initialized | - | git init 필요 |

**Missing dependencies with no fallback:**
- **Node.js >= 18.18.0**: Next.js 15 실행 불가. `nvs add 20 && nvs use 20 && nvs link 20`으로 해결 필수. 이것은 Phase 1 Wave 0의 첫 번째 작업이어야 함.

**Missing dependencies with fallback:**
- 없음

## Sources

### Primary (HIGH confidence)
- [npm registry] - yahoo-finance2@3.14.0, next@15.5.15, @tanstack/react-query@5.99.0, zustand@5.0.12, lucide-react@1.8.0, @google/genai@1.49.0, recharts@3.8.1 -- 모두 버전 확인됨
- [yahoo-finance2 GitHub](https://github.com/gadicc/yahoo-finance2) - quoteSummary 모듈 목록 (earningsTrend 포함 33개), quote() 필드 확인
- [feargreedchart.com/api-docs](https://feargreedchart.com/api-docs) - 무료 JSON API, 키 불필요, CORS 허용

### Secondary (MEDIUM confidence)
- [TanStack Query Polling Docs](https://tanstack.com/query/latest/docs/framework/react/guides/polling) - refetchInterval 함수 형태 지원 확인
- [Next.js engines field](https://www.npmjs.com/package/next) - Node.js >= 18.18.0 요구 확인

### Tertiary (LOW confidence)
- Yahoo Finance 심볼 매핑 (^GSPC, ^IXIC, BTC-USD, GC=F, ^TNX, DX-Y.NYB) -- 일반적으로 알려진 심볼이나 DX-Y.NYB는 실제 테스트 필요

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- 모든 패키지 npm registry에서 버전 확인, CLAUDE.md에 스택 확정
- Architecture: HIGH -- Next.js App Router + Route Handler 패턴은 공식 문서 기반
- Quant engine: HIGH -- 공식 계산이 PROJECT.md에 명확히 정의됨
- Fear & Greed sourcing: MEDIUM -- feargreedchart.com API 확인했으나 장기 안정성 미검증
- EPS Revision: MEDIUM -- earningsTrend 모듈 존재 확인, 실제 응답 구조는 런타임 검증 필요
- Pitfalls: HIGH -- 실제 환경 조사 기반 (Node.js 버전 이슈 발견)

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (안정 스택, 30일 유효)
