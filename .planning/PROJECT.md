# Quant Strategist Pro Dashboard (Alpha Engine)

## What This Is

18년 경력 시니어 매크로 전략가를 위한 **실시간 금융 대시보드**. 미국 주식 시장 및 매크로 지표를 직관적으로 센싱하고, 퀀트 기반의 기계적 대응 지표(Action Signals)를 제공하여 객관적 의사결정을 돕는다. Premium Minimal Brutalism 디자인 아이덴티티로 Vercel에 배포한다.

## Core Value

설정된 퀀트 로직(RS, MA50 이격도, Drawdown, Revision)에 따라 종목별 조건부 액션 시그널(Buy/Hold/Wait/Trim)을 자동 생성하여 기계적 대응을 가능케 한다.

## Requirements

### Validated

- [x] 3-Tab 시스템 (Strategic Overview / Watchlist / Monitoring List) — Validated in Phase 1-2
- [x] 상단 지표 해석 가이드(Alpha Watchlist Manual) 상시 노출 — Validated in Phase 2
- [x] Yahoo Finance API를 통한 실시간 시세 데이터 연동 (5분 주기 자동 갱신) — Validated in Phase 1
- [x] Market Snapshot 카드: S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, Fear & Greed — Validated in Phase 2
- [x] Market Opportunities & Risks 사이드바 패널 — Validated in Phase 2
- [x] Strategic Timeline (주요 경제 이벤트 일정) — Validated in Phase 2
- [x] Macro Threshold Warnings (10Y Yield 4.5%, DXY 106.0, Fear Index 30 이하 임계치 알림) — Validated in Phase 2
- [x] Numerical Checklist (종목별 조건부 대응: Buy/Hold/Wait/Trim 액션 시그널) — Validated in Phase 2
- [x] Watchlist 테이블 (12 종목): Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note — Validated in Phase 2
- [x] Monitoring List 테이블 (9 종목): 동일 컬럼 구조 — Validated in Phase 2
- [x] 퀀트 엔진: RS, MA50 Distance, Drawdown 자동 계산 — Validated in Phase 1
- [x] 조건부 액션 시그널 로직 자동 판정 — Validated in Phase 1
- [x] 테이블 정렬/필터링 (RS 강도순, 낙폭순) — Validated in Phase 2
- [x] 종목 검색 기능 — Validated in Phase 2
- [x] 반응형 모바일 대응 레이아웃 — Validated in Phase 2
- [x] Skeleton UI 로딩 상태 — Validated in Phase 2
- [x] Premium Minimal Brutalism 디자인 시스템 — Validated in Phase 2
- [x] 한국어 UI — Validated in Phase 2

### Active

- [ ] 3-Line Executive Summary (Gemini API 기반 AI 자동 생성)
- [ ] Vercel 배포

### Out of Scope

- 사용자 인증/로그인 — 개인 전용 대시보드, 불필요
- 종목 추가/삭제 UI — 초기 버전은 하드코딩된 종목 리스트
- 백엔드 DB — 모든 데이터는 API에서 실시간 fetch
- 알림/푸시 — v1에서는 대시보드 내 시각적 경고만 제공
- 다국어 지원 — 한국어 단일

## Context

- **참조 디자인:** Gemini Canvas로 생성된 대시보드 목업 (스크린샷 3장 기반)
- **데이터 소스:** Yahoo Finance (무료, API 키 불필요), Gemini API (Executive Summary 생성)
- **기본 Watchlist 종목:** AAPL, GOOGL, META, MSFT, NVDA, TSLA, PLTR, IONQ, OKLO, OXY, V, UNH
- **기본 Monitoring 종목:** MU, AMZN, NFLX, CEG, SO, NEE, BRK.B, LLY, JNJ
- **디자인 컬러:**
  - Background: `#F8FAFC` (Slate 50)
  - Primary: `#1E293B` (Deep Navy)
  - Accent: `#EA580C` (Burnt Orange) / `#2563EB` (Royal Blue)
  - 상승: Green, 하락: Red, 경고: Amber/Red
- **퀀트 공식:**
  - RS = (Ticker Change% / S&P500 Change%) × 100
  - MA50 Dist = (현재가 - MA50) / MA50 × 100
  - Drawdown = (현재가 - 52주 고가) / 52주 고가 × 100
- **액션 시그널 로직:**
  - Revision UP + RS > 110 + MA50 Dist < 5% → Buy (Quality Dip)
  - RS > 130 + MA50 Dist > 12% → Trim (Overheat)
  - Revision DOWN + RS < 90 → Wait (Weakness)
  - 나머지 → Hold (Neutral)

## Constraints

- **Tech Stack**: Next.js + Tailwind CSS + Lucide-react + TanStack Query — PRD 지정
- **API 비용**: Yahoo Finance 무료 티어 한도 내 운용, Gemini API 무료 티어 활용
- **Rate Limiting**: 5분 갱신 주기로 API 호출 최적화
- **배포 환경**: Vercel (환경변수로 API 키 관리)
- **상태관리**: Zustand 또는 React Context API

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Yahoo Finance API 선택 | 무료, API 키 불필요, 커버리지 충분 | — Pending |
| Gemini API로 Executive Summary | 무료 티어 활용 가능, 사용자 선호 | — Pending |
| Next.js 선택 | Vercel 배포 최적화, API Routes로 서버사이드 프록시 가능 | — Pending |
| 5분 데이터 갱신 주기 | 무료 API 제한 고려한 최적 밸런스 | — Pending |
| 한국어 UI | 사용자 선호 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-12 after Phase 2 (dashboard-ui) completion*
