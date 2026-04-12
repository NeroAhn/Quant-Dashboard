# Roadmap: Quant Strategist Pro Dashboard

## Overview

Build a real-time financial dashboard for a senior macro strategist. Phase 1 establishes the entire data pipeline and quant engine (the foundation everything else depends on). Phase 2 builds every visual surface -- tabs, tables, market cards, and the design system. Phase 3 integrates Gemini AI for executive summaries and deploys to Vercel. Three phases, each delivering a complete, verifiable capability layer.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation & Data Pipeline** - Project setup, Yahoo Finance integration, quant engine, action signal logic, and API routes
- [ ] **Phase 2: Dashboard UI** - Tab navigation, watchlist/monitoring tables, market snapshot cards, macro warnings, design system
- [ ] **Phase 3: AI Intelligence & Deployment** - Gemini executive summary integration and Vercel production deployment

## Phase Details

### Phase 1: Foundation & Data Pipeline
**Goal**: All market data flows through server-side API routes, quant metrics are computed correctly, and action signals are generated mechanically from the defined rules
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, DATA-08, QENG-01, QENG-02, QENG-03, QENG-04, ASIG-01, ASIG-02, ASIG-03, ASIG-04, ASIG-05
**Success Criteria** (what must be TRUE):
  1. Visiting /api/watchlist returns JSON with all 21 tickers including price, 1D change, 52-week high, RS, MA50 distance, drawdown, and action signal fields
  2. Visiting /api/market-data returns JSON with current values for S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, and Fear & Greed
  3. Action signals (Buy/Hold/Wait/Trim) are correctly assigned based on the defined quant rules when given known test inputs
  4. Data auto-refreshes on a 5-minute interval without manual page reload, with skeleton placeholders shown during initial load and a freshness timestamp displayed
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 15 프로젝트 초기화, 타입 정의, 상수 확립
- [x] 01-02-PLAN.md — 퀀트 엔진(RS/MA50/Drawdown) TDD 구현 + Watchlist/Monitoring API 라우트
- [x] 01-03-PLAN.md — Market Data API 라우트 (시장 지표 + Fear & Greed Index)
- [x] 01-04-PLAN.md — TanStack Query 훅, Zustand 스토어, 데이터 파이프라인 통합 검증

### Phase 2: Dashboard UI
**Goal**: Users can navigate a 3-tab dashboard to view market overview, watchlist, and monitoring list with full quant data rendered in the Premium Minimal Brutalism design
**Depends on**: Phase 1
**Requirements**: TAB1-02, TAB1-03, TAB1-04, TAB1-05, TAB1-06, TAB1-07, TAB1-08, TAB2-01, TAB2-02, TAB2-03, TAB2-04, TAB2-05, TAB2-06, TAB2-07, DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05, DSGN-06
**Success Criteria** (what must be TRUE):
  1. User can switch between Strategic Overview, Watchlist, and Monitoring List tabs and each tab renders its content correctly
  2. Watchlist table displays 12 tickers and Monitoring table displays 9 tickers, each with all specified columns (Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note) and color-coded action signal badges
  3. User can sort tables by RS strength and drawdown, search for symbols, and see RS/Revision color coding applied
  4. Strategic Overview tab shows 7 market snapshot cards with values and directional indicators, macro threshold warnings when breached, and the Numerical Checklist with action signal summary
  5. Dashboard renders correctly on mobile with responsive layout, uses Korean UI labels, and follows the Premium Minimal Brutalism color palette with Lucide icons
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — 디자인 시스템 기초 (Tailwind 브랜드 컬러, 공유 상수) + 레이아웃/정적 개요 컴포넌트 추출
- [x] 02-02-PLAN.md — 공유 StockTable 컴포넌트 (정렬/검색/모바일 카드 뷰) + Watchlist/Monitoring 탭 래퍼
- [x] 02-03-PLAN.md — 동적 개요 컴포넌트 (MarketCards/ThresholdWarnings/NumericalChecklist) + page.tsx 오케스트레이터 재작성
- [x] 02-04-PLAN.md — [Gap closure] Drawdown 정렬 UI 트리거 누락 수정 (TAB2-04)

### Phase 3: AI Intelligence & Deployment
**Goal**: The dashboard features an AI-generated 3-line executive summary and is live on Vercel for daily use
**Depends on**: Phase 2
**Requirements**: TAB1-01, DEPL-01, DEPL-02, DEPL-03
**Success Criteria** (what must be TRUE):
  1. Strategic Overview tab displays a 3-line AI-generated market summary powered by Gemini, refreshed every 30 minutes, with graceful fallback when the API is unavailable
  2. Dashboard is accessible at a Vercel URL, production build completes without errors, and Gemini API key is managed via environment variables
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Gemini AI Executive Summary 통합 (SDK + 프롬프트 + 캐시 + API 라우트 + UI 컴포넌트)
- [ ] 03-02-PLAN.md — 환경변수 관리 + 프로덕션 빌드 검증 + Vercel 배포

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Pipeline | 0/4 | Planning complete | - |
| 2. Dashboard UI | 0/4 | Gap closure planned | - |
| 3. AI Intelligence & Deployment | 0/2 | Planning complete | - |
