# Requirements: Quant Strategist Pro Dashboard

**Defined:** 2026-04-12
**Core Value:** 퀀트 로직(RS, MA50 이격도, Drawdown, Revision)에 따라 종목별 조건부 액션 시그널을 자동 생성하여 기계적 대응을 가능케 한다.

## v1 Requirements

### Data Pipeline (데이터 파이프라인)

- [ ] **DATA-01**: Yahoo Finance API를 통해 21개 종목(Watchlist 12 + Monitoring 9)의 실시간 시세를 가져온다
- [ ] **DATA-02**: 시세 데이터는 5분 주기로 자동 갱신된다
- [ ] **DATA-03**: Market Snapshot 지표(S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY)를 가져온다
- [ ] **DATA-04**: Fear & Greed Index 데이터를 가져온다
- [ ] **DATA-05**: Next.js API Routes를 통해 서버사이드에서 데이터를 프록시한다
- [ ] **DATA-06**: TanStack Query로 클라이언트 캐싱 및 자동 갱신을 관리한다
- [ ] **DATA-07**: 데이터 로딩 시 Skeleton UI를 표시한다
- [ ] **DATA-08**: 데이터 갱신 시각(freshness indicator)을 표시한다

### Quant Engine (퀀트 엔진)

- [ ] **QENG-01**: Relative Strength(RS)를 자동 계산한다 — RS = (종목 변동% / S&P500 변동%) × 100
- [ ] **QENG-02**: MA50 이격도를 자동 계산한다 — (현재가 - MA50) / MA50 × 100
- [ ] **QENG-03**: Drawdown을 자동 계산한다 — (현재가 - 52주 고가) / 52주 고가 × 100
- [ ] **QENG-04**: 부동소수점 오차를 고려한 임계값 비교 로직을 적용한다

### Action Signals (액션 시그널)

- [ ] **ASIG-01**: Revision UP + RS > 110 + MA50 Dist < 5% → Buy (Quality Dip)
- [ ] **ASIG-02**: RS > 130 + MA50 Dist > 12% → Trim (Overheat)
- [ ] **ASIG-03**: Revision DOWN + RS < 90 → Wait (Weakness)
- [ ] **ASIG-04**: 기타 조건 → Hold (Neutral)
- [ ] **ASIG-05**: 각 시그널에 색상 코딩 적용 (Buy=Green, Trim=Red, Wait=Yellow, Hold=Gray)

### Tab 1: Strategic Overview

- [ ] **TAB1-01**: 3-Line Executive Summary를 Gemini API로 자동 생성한다 (30분 간격 캐싱)
- [x] **TAB1-02**: Market Snapshot 카드 7개를 표시한다 (S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, Fear & Greed)
- [x] **TAB1-03**: 각 카드에 현재값, 변동률, 방향 화살표를 표시한다
- [x] **TAB1-04**: Macro Threshold Warnings를 표시한다 (10Y Yield 4.5%, DXY 106.0, Fear Index 30 이하)
- [x] **TAB1-05**: 임계치 돌파 시 Amber/Red Alert UI를 활성화한다
- [x] **TAB1-06**: Market Opportunities & Risks 사이드바 패널을 표시한다
- [x] **TAB1-07**: Strategic Timeline에 주요 경제 이벤트 일정을 표시한다
- [x] **TAB1-08**: Numerical Checklist에 종목별 액션 시그널 요약을 표시한다

### Tab 2 & 3: Watchlist & Monitoring List

- [x] **TAB2-01**: Watchlist 테이블에 12개 종목을 표시한다
- [x] **TAB2-02**: Monitoring List 테이블에 9개 종목을 표시한다
- [x] **TAB2-03**: 테이블 컬럼: Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note
- [x] **TAB2-04**: RS 강도순 및 낙폭순 정렬 기능을 제공한다
- [x] **TAB2-05**: 리스트 내 종목 검색 기능을 제공한다
- [x] **TAB2-06**: RS > 110일 때 녹색, RS < 90일 때 빨간색으로 색상 코딩한다
- [x] **TAB2-07**: Revision UP/DOWN/NEUTRAL을 색상 배지로 표시한다

### Design System (디자인 시스템)

- [x] **DSGN-01**: Premium Minimal Brutalism 디자인 아이덴티티를 적용한다
- [x] **DSGN-02**: 컬러 팔레트: Background #F8FAFC, Primary #1E293B, Accent #EA580C/#2563EB
- [x] **DSGN-03**: 상단에 Alpha Watchlist Manual(지표 해석 가이드) 레전드를 상시 노출한다
- [x] **DSGN-04**: 반응형 모바일 레이아웃을 지원한다
- [x] **DSGN-05**: 한국어 UI 라벨 및 설명을 적용한다
- [x] **DSGN-06**: Lucide-react 아이콘을 사용한다

### Deployment (배포)

- [ ] **DEPL-01**: Vercel에 배포한다
- [ ] **DEPL-02**: 환경변수(.env)로 API 키(Gemini)를 관리한다
- [ ] **DEPL-03**: 프로덕션 빌드가 에러 없이 완료된다

## v2 Requirements

### 고급 기능

- **ADV-01**: 종목 추가/삭제 UI (사용자 커스텀 워치리스트)
- **ADV-02**: 다크 모드
- **ADV-03**: 알림/푸시 (임계치 돌파 시)
- **ADV-04**: 캔들스틱 차트 / 미니 차트
- **ADV-05**: 포트폴리오 P&L 추적

## Out of Scope

| Feature | Reason |
|---------|--------|
| 사용자 인증/로그인 | 개인 전용 대시보드, 불필요 |
| 백엔드 DB | 모든 데이터는 API에서 실시간 fetch |
| WebSocket 실시간 스트리밍 | Yahoo Finance 무료 티어 미지원, 5분 폴링으로 충분 |
| 백테스팅 | 별도 제품 카테고리, 범위 초과 |
| 다국어 지원 | 한국어 단일 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| DATA-06 | Phase 1 | Pending |
| DATA-07 | Phase 1 | Pending |
| DATA-08 | Phase 1 | Pending |
| QENG-01 | Phase 1 | Pending |
| QENG-02 | Phase 1 | Pending |
| QENG-03 | Phase 1 | Pending |
| QENG-04 | Phase 1 | Pending |
| ASIG-01 | Phase 1 | Pending |
| ASIG-02 | Phase 1 | Pending |
| ASIG-03 | Phase 1 | Pending |
| ASIG-04 | Phase 1 | Pending |
| ASIG-05 | Phase 1 | Pending |
| TAB1-01 | Phase 3 | Pending |
| TAB1-02 | Phase 2 | Complete |
| TAB1-03 | Phase 2 | Complete |
| TAB1-04 | Phase 2 | Complete |
| TAB1-05 | Phase 2 | Complete |
| TAB1-06 | Phase 2 | Complete |
| TAB1-07 | Phase 2 | Complete |
| TAB1-08 | Phase 2 | Complete |
| TAB2-01 | Phase 2 | Complete |
| TAB2-02 | Phase 2 | Complete |
| TAB2-03 | Phase 2 | Complete |
| TAB2-04 | Phase 2 | Complete |
| TAB2-05 | Phase 2 | Complete |
| TAB2-06 | Phase 2 | Complete |
| TAB2-07 | Phase 2 | Complete |
| DSGN-01 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |
| DSGN-03 | Phase 2 | Complete |
| DSGN-04 | Phase 2 | Complete |
| DSGN-05 | Phase 2 | Complete |
| DSGN-06 | Phase 2 | Complete |
| DEPL-01 | Phase 3 | Pending |
| DEPL-02 | Phase 3 | Pending |
| DEPL-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-04-12*
*Last updated: 2026-04-12 after roadmap creation*
