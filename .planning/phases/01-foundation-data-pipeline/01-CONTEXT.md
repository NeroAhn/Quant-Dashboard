# Phase 1: Foundation & Data Pipeline - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js 프로젝트 셋업, Yahoo Finance API 연동 (서버사이드 프록시), 퀀트 엔진(RS/MA50 이격도/Drawdown) 자동 계산, 액션 시그널(Buy/Hold/Wait/Trim) 로직 구현, TanStack Query 기반 자동 갱신 파이프라인 구축. 모든 UI의 기반이 되는 데이터 계층을 완성한다.

</domain>

<decisions>
## Implementation Decisions

### API 구조 & 라우트 설계
- **D-01:** API 엔드포인트를 3개로 분리: `/api/watchlist` (12종목), `/api/monitoring` (9종목), `/api/market-data` (S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, Fear & Greed). 탭별 독립 갱신 및 장애 격리 가능.
- **D-02:** API 호출 실패 시 부분 반환 — 성공한 종목은 정상 데이터, 실패한 종목은 `null` 또는 에러 필드로 표시. 프론트에서 해당 행만 "데이터 없음" 처리.
- **D-03:** RS 등 퀀트 계산은 서버에서 처리. S&P 500 데이터를 내부적으로 공유하여 클라이언트는 계산된 결과만 수신.
- **D-04:** Yahoo Finance API 호출은 3그룹 병렬 (watchlist / monitoring / market-data). API 엔드포인트 분리와 일치.

### Fear & Greed / Revision 데이터 소싱
- **D-05:** Fear & Greed Index는 대체 무료 API(`fear-and-greed` npm 패키지 등) 활용. 리서치 단계에서 패키지 신뢰도 검증.
- **D-06:** EPS Revision은 yahoo-finance2 `earningsTrend` 모듈 우선 시도. 실제 응답에서 EPS 추정치 변화를 추출하여 UP/DOWN/NEUTRAL로 변환. 실패 시 대안 소스로 전환.
- **D-07:** Fear & Greed 표시 형태는 숫자 + 텍스트 라벨 (`42 (Fear)`). 목업과 동일.

### 퀀트 엔진 계산 기준
- **D-08:** Wait 조건은 OR 로직 — `Revision DOWN || RS < 90` 중 하나만 충족해도 Wait. PROJECT.md 스펙(AND)과 다르며, 목업 코드 기준으로 확정. 위험 신호에 더 민감하게 반응.
- **D-09:** RS 계산 시 변동% 기간은 1일(1D). 당일 변동률 기준. 매일 센싱하는 대시보드 성격에 부합.
- **D-10:** MA50 데이터 소싱은 Claude 재량. yahoo-finance2 `quote()`의 `fiftyDayAverage` 필드가 있으면 활용, 없으면 `historical()`로 직접 계산.

### 에러 처리 & 데이터 Freshness
- **D-11:** API 장애 시 에러 상태 전환. 실패한 영역은 에러 메시지로 대체하며, stale 데이터를 유지하지 않음. 금융 데이터의 정확성 우선.
- **D-12:** 장 운영시간(ET 9:30-16:00) 5분 갱신, 장 마감 후 30분 간격. BTC/Gold/DXY 등 24시간 자산은 마감 후에도 갱신 지속. API 호출 최적화.

### Claude's Discretion
- MA50 데이터 소싱 방식 (D-10): `fiftyDayAverage` 필드 유무에 따라 판단
- 부동소수점 임계값 비교 시 epsilon 범위: 구현 시 적절한 값 적용

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 프로젝트 스펙
- `.planning/PROJECT.md` — 프로젝트 비전, 퀀트 공식, 액션 시그널 로직 정의, 종목 리스트, 디자인 컬러
- `.planning/REQUIREMENTS.md` — v1 요구사항 전체 (DATA-01~08, QENG-01~04, ASIG-01~05 이 페이즈 해당)
- `.planning/ROADMAP.md` — Phase 1 Success Criteria (4개 검증 조건)
- `CLAUDE.md` — 기술 스택 상세 (yahoo-finance2, TanStack Query, Zustand 등)

### 목업 참조
- 사용자 제공 대시보드 목업 코드 (React 컴포넌트) — 액션 시그널 로직(`getDecisionAction`), 데이터 구조, UI 컬럼 정의의 실제 참조. CONTEXT.md의 D-08 결정 근거.

### 기술 문서 (리서치 단계 참조)
- yahoo-finance2 npm: `quote()`, `quoteSummary()`, `historical()` API
- `@google/genai` (NOT `@google/generative-ai`) — Phase 3에서 사용하지만 설치는 Phase 1에서 가능
- TanStack Query `refetchInterval` + `refetchIntervalInBackground` 설정

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 없음 (그린필드 프로젝트)

### Established Patterns
- 없음 (Phase 1에서 패턴 수립)

### Integration Points
- Next.js App Router의 Route Handlers (`/api/*`)가 yahoo-finance2 호출 프록시
- TanStack Query가 클라이언트에서 API 응답 캐싱 및 자동 갱신 관리
- Zustand 스토어가 탭 상태, 필터/정렬 설정 등 클라이언트 상태 관리

</code_context>

<specifics>
## Specific Ideas

- 액션 시그널 로직은 목업 코드의 `getDecisionAction` 함수를 정확히 재현해야 함 (OR 로직 확정)
- PROJECT.md의 액션 시그널 스펙을 D-08 결정에 맞게 수정 필요 (AND → OR)
- Fear & Greed 카드는 다른 Market Snapshot 카드와 동일한 UI이지만 change 필드가 텍스트(`Fear`)인 점 고려

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-data-pipeline*
*Context gathered: 2026-04-12*
