# Phase 2: Dashboard UI - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

3-Tab 대시보드의 모든 시각적 표면을 완성한다. 탭 네비게이션, Watchlist/Monitoring 테이블 (정렬/검색/컬러코딩), Market Snapshot 카드, Macro Threshold Warnings (동적 연동), Numerical Checklist, Opportunities & Risks 사이드바, Strategic Timeline, 그리고 Premium Minimal Brutalism 디자인 시스템. 현재 page.tsx(715줄) 단일 파일을 컴포넌트로 분해하고, Zustand 스토어와 연동한다.

</domain>

<decisions>
## Implementation Decisions

### 컴포넌트 분해 전략
- **D-01:** 탭별 컴포넌트 분리. `src/components/` 하위에 `layout/`, `overview/`, `tables/`, `ui/` 디렉토리 구조 적용.
  - `layout/`: Header, TabNavigation, MetricGuide
  - `overview/`: StrategicOverview, MarketCards, ThresholdWarnings, NumericalChecklist, SidePanel
  - `tables/`: StockTable (공유), WatchlistTab, MonitoringTab
  - `ui/`: ActionBadge, RevisionBadge, SearchBar, SortHeader
- **D-02:** Watchlist와 Monitoring 테이블은 하나의 StockTable 컴포넌트로 통합. tickers, title, description을 props로 전달하여 코드 중복 제거.
- **D-03:** Static 데이터(Executive Summary, Opportunities/Risks, Timeline)는 현재 placeholder 그대로 유지. 컴포넌트만 분리하고 Phase 3에서 Gemini API 연동 시 교체.

### 디자인 시스템 정체성
- **D-04:** 현재 스타일 유지 — rounded-xl, shadow-sm, border 카드 스타일. Premium Minimal Brutalism을 "깔끔하고 전문적인 데이터 중심 디자인"으로 해석. 기존 목업 스타일과 일치.
- **D-05:** PRD 컬러 팔레트 엄격 적용. Tailwind 커스텀 컬러로 등록:
  - Background: `#F8FAFC` (Slate 50)
  - Primary: `#1E293B` (Deep Navy)
  - Accent: `#EA580C` (Burnt Orange) / `#2563EB` (Royal Blue)
  - 상승: Green, 하락: Red, 경고: Amber/Red
- **D-06:** 모바일에서 테이블은 카드 뷰로 변환. 8컬럼 금융 데이터를 카드 형태로 재구성하여 모바일 가독성 확보.

### 테이블 인터랙션
- **D-07:** 컬럼 헤더 클릭으로 정렬. 화살표 아이콘으로 현재 정렬 방향 표시. Zustand 스토어의 sortConfig와 연동하여 탭 전환 시에도 정렬 상태 유지.
- **D-08:** 검색 바는 각 테이블 상단에 배치. 심볼명 필터링. Zustand의 searchQuery와 연동하여 탭 전환 시 검색어 유지.
- **D-09:** Strategic Note 컬럼 추가 (TAB2-03). 데이터는 '-' 또는 빈칸으로 표시. 향후 수동 입력 또는 AI 연동 가능하도록 구조만 마련.

### Macro Warning 동적 연동
- **D-10:** 임계치 돌파 시 해당 Market Card의 테두리/배경색이 Amber/Red로 변경. Threshold Warnings 섹션에서도 활성 상태 표시. constants.ts의 MACRO_THRESHOLDS와 market-data API 응답 비교.
- **D-11:** Threshold Warnings 섹션에 실제 API 값 포함 표시. 예: "현재 10Y Yield: 4.62% (임계치 4.5% 돌파)" 형태로 동적 값과 static 설명 텍스트 결합.

### Claude's Discretion
- StockTable의 모바일 카드 뷰 세부 레이아웃 (어떤 정보를 우선 표시할지)
- Overview 탭 내 섹션별 반응형 breakpoint 세부 조정
- Skeleton UI 컴포넌트의 세부 형태 (기존 skeleton.tsx 확장 방식)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 프로젝트 스펙
- `.planning/PROJECT.md` -- 프로젝트 비전, 디자인 컬러 팔레트, 종목 리스트, 퀀트 공식
- `.planning/REQUIREMENTS.md` -- Phase 2 요구사항 (TAB1-02~08, TAB2-01~07, DSGN-01~06)
- `.planning/ROADMAP.md` -- Phase 2 Success Criteria (5개 검증 조건)
- `CLAUDE.md` -- 기술 스택 상세 (Tailwind v4, Lucide-react, Recharts, Zustand)

### Phase 1 컨텍스트
- `.planning/phases/01-foundation-data-pipeline/01-CONTEXT.md` -- API 구조(D-01~D-04), Fear & Greed 표시 형태(D-07), 에러 처리(D-11), 갱신 주기(D-12)

### 기존 코드 (Phase 1 산출물)
- `src/types/dashboard.ts` -- WatchlistItem, MarketDataItem, FearGreedData 타입 정의
- `src/store/dashboard.ts` -- Zustand 스토어 (activeTab, searchQuery, sortConfig)
- `src/lib/constants.ts` -- MACRO_THRESHOLDS, QUANT_THRESHOLDS, 종목 리스트
- `src/hooks/use-watchlist.ts`, `use-monitoring.ts`, `use-market-data.ts` -- TanStack Query 훅
- `src/components/skeleton.tsx` -- 기존 Skeleton 컴포넌트
- `src/app/page.tsx` -- 현재 단일 파일 UI (분해 대상)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/dashboard.ts`: Zustand 스토어에 activeTab, searchQuery, sortConfig 이미 정의. 현재 page.tsx에서 useState를 대신 사용 중 -- 스토어로 전환 필요.
- `src/components/skeleton.tsx`: MarketCardSkeleton, TableSkeleton 컴포넌트 존재. 확장하여 활용.
- `src/lib/constants.ts`: MACRO_THRESHOLDS (10Y: 4.5, DXY: 106.0, Fear: 30) 이미 정의됨. 동적 연동에 그대로 사용.
- `src/types/dashboard.ts`: WatchlistItem에 QuantMetrics(rs, ma50Dist, drawdown, action, revision) 포함. 테이블 렌더링에 직접 사용.

### Established Patterns
- TanStack Query 훅: useWatchlist, useMonitoring, useMarketData -- isPending, data, error 패턴 확립
- 컬러 코딩: ACTION_COLORS, REVISION_COLORS 상수 이미 page.tsx에 정의됨 -- 컴포넌트 분리 시 재사용
- 장/마감 갱신 주기: getStockRefetchInterval() 함수 패턴 확립

### Integration Points
- page.tsx의 로컬 useState -> Zustand 스토어 전환
- 기존 ACTION_COLORS, REVISION_COLORS -> ui/ 컴포넌트로 이동
- market-data API 응답 -> MACRO_THRESHOLDS 비교 로직 추가

</code_context>

<specifics>
## Specific Ideas

- Zustand persist 미들웨어가 이미 적용되어 있어 사용자의 정렬/검색 설정이 localStorage에 유지됨
- Watchlist/Monitoring 테이블 컬럼 순서: Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note, Action (TAB2-03 스펙)
- RS > 110 녹색, RS < 90 빨간색 컬러코딩 이미 page.tsx에 구현됨 -- 컴포넌트 분리 시 유지
- Revision UP/DOWN/NEUTRAL 배지도 이미 구현됨 -- 유지
- 한국어 UI 라벨 (DSGN-05): 현재 혼합 상태 -- 일관되게 한국어화 필요

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 02-dashboard-ui*
*Context gathered: 2026-04-12*
