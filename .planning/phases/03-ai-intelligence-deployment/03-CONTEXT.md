# Phase 3: AI Intelligence & Deployment - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Gemini AI 기반 3-Line Executive Summary 생성 기능 구현 및 Vercel 프로덕션 배포. 기존 StrategicOverview.tsx의 static placeholder를 Gemini API 연동으로 교체하고, 서버사이드 캐싱으로 무료 티어 한도 내 운용. 프로덕션 빌드 검증 후 Vercel 배포 완료.

</domain>

<decisions>
## Implementation Decisions

### Summary 프롬프트 전략
- **D-01:** Gemini에 전체 데이터 통합 입력 — Market data(S&P 500, NASDAQ, BTC, Gold, 10Y Yield, DXY, Fear & Greed) + Watchlist/Monitoring 종목별 핵심 지표(RS, MA50 Dist, Drawdown, Action Signal) + Macro Threshold 돌파 여부. 모든 탭의 데이터를 종합하여 가장 풍부한 요약 생성.
- **D-02:** 3줄 구조 고정 — `1. [Macro]` / `2. [Quant]` / `3. [Market Implication]` 형식을 프롬프트에서 강제. 현재 placeholder와 동일한 구조 유지. 전략가가 빠르게 스캔 가능한 일관된 형식.

### 캐싱 & Fallback 정책
- **D-03:** 서버사이드 in-memory 캐싱 30분. API Route에서 Gemini 응답을 캐시하여 무료 티어 한도(250회/일) 보호. 모든 클라이언트가 동일한 요약 수신.
- **D-04:** API 장애 시 마지막 성공 요약 유지. 캐시된 마지막 성공 응답을 계속 표시하고 "캐시된 데이터" 표시. 사용자는 빈 공간 대신 지난 요약이라도 볼 수 있음.

### Summary 톤 & 언어
- **D-05:** 한국어로 생성. UI 전체가 한국어(DSGN-05)이므로 Executive Summary도 한국어. 금융 용어(RS, Drawdown, MA50 등)는 영어 그대로 사용 가능 (현재 placeholder 스타일과 동일).
- **D-06:** 전략가 브리핑 톤. 간결하고 단정적인 전문가 어조. 현재 placeholder와 동일한 스타일: actionable 인사이트 포함, "~권장", "~반영 중" 식의 표현.

### 배포 & 환경 설정
- **D-07:** Vercel 기본 도메인 사용 (*.vercel.app). 개인 전용 대시보드이므로 커스텀 도메인 불필요.
- **D-08:** 기본 설정만 적용. GEMINI_API_KEY 환경변수 설정 외 추가 최적화(Edge Runtime, ISR 등) 불필요. Next.js 기본 빌드 설정 사용.

### Claude's Discretion
- Gemini 프롬프트의 세부 워딩 및 토큰 길이 제한
- 서버사이드 캐시 구현 방식 (Map vs 변수)
- TanStack Query의 Executive Summary용 refetchInterval 세부값 (30분 이내)
- Vercel 배포 시 빌드 명령어 및 출력 디렉토리 설정

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 프로젝트 스펙
- `.planning/PROJECT.md` — 프로젝트 비전, Gemini API 활용 결정, 종목 리스트, 퀀트 공식
- `.planning/REQUIREMENTS.md` — Phase 3 요구사항 (TAB1-01, DEPL-01, DEPL-02, DEPL-03)
- `.planning/ROADMAP.md` — Phase 3 Success Criteria (2개 검증 조건)
- `CLAUDE.md` — 기술 스택 상세 (`@google/genai` SDK, Gemini 2.5 Flash, 무료 티어 제약)

### Phase 1-2 컨텍스트
- `.planning/phases/01-foundation-data-pipeline/01-CONTEXT.md` — API 구조(D-01~D-04), 에러 처리(D-11), 갱신 주기(D-12)
- `.planning/phases/02-dashboard-ui/02-CONTEXT.md` — 컴포넌트 구조(D-01~D-03), 디자인 시스템(D-04~D-05)

### 기존 코드 (교체 대상)
- `src/components/overview/StrategicOverview.tsx` — Executive Summary placeholder가 위치한 컴포넌트. Gemini 연동 시 이 영역만 동적으로 교체.

### 기술 문서 (리서치 단계 참조)
- `@google/genai` npm — Gemini 2.5 Flash API 호출 방법, 무료 티어 제약 (10 RPM, 250 daily)
- NOT `@google/generative-ai` — deprecated, EOL August 2025

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/overview/StrategicOverview.tsx`: Executive Summary placeholder 영역 — Gemini API 응답으로 교체 대상
- `src/app/api/` 하위 라우트 패턴: `watchlist/`, `monitoring/`, `market-data/` — 동일 패턴으로 `/api/executive-summary` 추가
- `src/hooks/use-watchlist.ts`, `use-monitoring.ts`, `use-market-data.ts` — TanStack Query 훅 패턴 참조하여 `use-executive-summary.ts` 생성
- `src/lib/constants.ts` — MACRO_THRESHOLDS, 종목 리스트 등 Gemini 프롬프트 구성 시 활용 가능

### Established Patterns
- TanStack Query: `isPending`, `data`, `error` 패턴, `refetchInterval` 설정
- API Route: Next.js Route Handler에서 서버사이드 데이터 처리
- 에러 처리: Phase 1에서 확립된 부분 반환 패턴

### Integration Points
- `StrategicOverview.tsx`의 Executive Summary 하드코딩 영역 → 동적 컴포넌트로 교체
- 새 API Route `/api/executive-summary` → Gemini API 호출 + 서버사이드 캐싱
- 새 TanStack Query 훅 → Executive Summary 데이터 페칭
- Gemini 프롬프트에 watchlist + monitoring + market-data API 응답 데이터 통합 전달

</code_context>

<specifics>
## Specific Ideas

- 프롬프트에서 `1. [Macro]` / `2. [Quant]` / `3. [Market Implication]` 형식을 명시적으로 강제하여 출력 일관성 확보
- 현재 placeholder 텍스트가 이상적인 출력 예시 — 프롬프트의 few-shot example로 활용 가능
- 서버사이드 캐시에 timestamp 포함하여 클라이언트에서 "30분 전 생성" 등 freshness 표시 가능
- Gemini API 키는 `GEMINI_API_KEY` 환경변수로 관리 (DEPL-02)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-intelligence-deployment*
*Context gathered: 2026-04-12*
