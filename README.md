# Quant Strategist Pro Dashboard

18년 경력 시니어 매��로 전략가를 위한 **실시간 ���융 대시보드**.
미국 주식 시장 및 매크로 지표를 직관적으로 센싱하고, 퀀트 기���의 기계적 대응 지표(Action Signals)를 제공합니다.

**Live:** [quant-dashboard-gules.vercel.app](https://quant-dashboard-gules.vercel.app)

## Features

### Strategic Overview
- **3-Line Executive Summary** — Gemini 2.5 Flash AI가 생성하는 한국어 시장 브리핑 (`[Macro] / [Quant] / [Market Implication]`)
- **Market Snapshot** — S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, Fear & Greed 실시간 카드
- **Macro Threshold Warnings** — 10Y Yield 4.5%, DXY 106.0, Fear Index 30 이하 임계치 알림
- **Numerical Checklist** — 종목별 Buy/Hold/Wait/Trim 액션 시그널 요약
- **Market Opportunities & Risks** — 사이드바 패널
- **Strategic Timeline** — 주요 경제 이벤트 일정

### Watchlist (12 Primary Tickers)
종목별 Price, 1D%, 52W High, Drawdown, RS(상대강도), MA50 이격도, Revision, FWD P/E, Action Signal 표시. 정렬/검색 지원.

### Monitoring List (9 Secondary Tickers)
동일 컬럼 구조로 보조 관찰 종목 추적.

### Quant Engine
- **RS (Relative Strength)** — S&P 500 대비 상대강도
- **MA50 Distance** — 50일 이동평균 이격도
- **Drawdown** — 52주 고점 대비 하락률
- **Action Signal** — RS, MA50 Dist, Drawdown, Revision 조합으로 Buy/Hold/Wait/Trim 자동 판정

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Data Fetching | TanStack Query v5 (5분 자동 갱신) |
| State Management | Zustand v5 |
| Market Data | yahoo-finance2 (서버사이드, API 키 불필요) |
| AI Summary | @google/genai (Gemini 2.5 Flash, 30분 캐시) |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

http://localhost:3000 에서 확인.

### Environment Variables

`.env.local` 파일 생성:

```env
# AI Executive Summary 활성화 (선택사항)
# https://aistudio.google.com/apikey 에서 발급
GEMINI_API_KEY=your_api_key_here
```

> GEMINI_API_KEY 없이도 대시보드는 정상 동작합니다. AI 요약만 비활성화됩니다.

## Project Structure

```
src/
├── app/
│   ��── api/
│   │   ├── executive-summary/   # Gemini AI 요약 엔드포인트
│   │   ���── market-data/         # 시장 지표 엔드포인트
│   │   ├── watchlist/           # 워치리스트 엔드포인트
│   │   └── monitoring/          # 모�����링 엔드포인트
│   ├── page.tsx                 # 메인 대시보드
│   └── globals.css              # Tailwind v4 + 디자인 토��
├── components/
│   ├── layout/                  # Header, TabNavigation, MetricGuide
│   ├��─ overview/                # StrategicOverview, ExecutiveSummary, MarketCards
│   ├── tables/                  # StockTable, WatchlistTab, MonitoringTab
│   └── ui/                      # ActionBadge, RevisionBadge, SearchBar, SortHeader
├── hooks/                       # TanStack Query 커스텀 훅
├── lib/
│   ├── gemini/                  # Gemini SDK 클라이언트, 프롬프트, 캐시
│   ├── yahoo-finance/           # Yahoo Finance 클라이언트
│   ├── quant/                   # RS, MA50 Dist, Drawdown, Action Signal 엔진
│   ├── fear-greed/              # Fear & Greed Index 클라이언트
│   └── constants.ts             # 종목 리스트, 매크로 임계치
├── store/                       # Zustand 스토어
└── types/                       # TypeScript 타입 정의
```

## Design

**Premium Minimal Brutalism** — 깔끔한 흰색 배경에 모노스페이스 숫자, 조건부 컬러 코딩(상승/하락/경고), 그리고 절제된 액센트 컬러(Blue `#2563EB`, Orange `#EA580C`)로 데이터 중심의 전문가 UI를 구현합니다.

## License

Private — Personal use only.
