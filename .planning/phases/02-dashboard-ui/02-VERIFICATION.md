---
phase: 02-dashboard-ui
verified: 2026-04-12T14:00:00Z
status: gaps_found
score: 4/5 roadmap success criteria verified
overrides_applied: 0
gaps:
  - truth: "User can sort tables by RS strength and drawdown"
    status: partial
    reason: "The StockTable renders the drawdown column as a plain <th> (not a SortHeader), so users cannot click it to trigger drawdown sort. The sort logic in both Zustand (setSortConfig) and StockTable correctly handles the 'drawdown' field — the backend is complete — but the UI trigger is missing. TAB2-04 requires 'RS 강도순 및 낙폭순 정렬 기능'."
    artifacts:
      - path: "src/components/tables/StockTable.tsx"
        issue: "Line 98: `<th className=\"px-6 py-4\">고가 / 낙폭</th>` should be `<SortHeader field=\"drawdown\" label=\"고가 / 낙폭\" />` to expose the sort trigger in the UI"
    missing:
      - "Replace the plain <th> for the drawdown column header (line 98 of StockTable.tsx) with <SortHeader field=\"drawdown\" label=\"고가 / 낙폭\" />"
human_verification:
  - test: "Visual confirmation of 3-tab navigation"
    expected: "Clicking the 3 tab buttons (전략 개요, 워치리스트, 모니터링 리스트) switches content correctly; active tab is highlighted in brand-accent-blue"
    why_human: "Tab switching is conditional JSX rendered client-side; visual confirmation of active state highlight cannot be verified programmatically"
  - test: "MarketCards amber border on threshold breach"
    expected: "When 10Y Yield >= 4.5 or DXY >= 106.0 or Fear & Greed <= 30, the corresponding card shows amber border (border-amber-400 bg-amber-50)"
    why_human: "Threshold breach state depends on live market data values at runtime; cannot be triggered programmatically in static analysis"
  - test: "Mobile responsive card view"
    expected: "On a mobile viewport, the stock table disappears and is replaced by stacked cards with Symbol+ActionBadge header and a 2x2 metrics grid"
    why_human: "Responsive CSS behavior (md:hidden / hidden md:block) requires browser/viewport testing"
---

# Phase 2: Dashboard UI Verification Report

**Phase Goal:** Users can navigate a 3-tab dashboard to view market overview, watchlist, and monitoring list with full quant data rendered in the Premium Minimal Brutalism design
**Verified:** 2026-04-12T14:00:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can switch between Strategic Overview, Watchlist, and Monitoring List tabs and each tab renders its content correctly | ✓ VERIFIED | page.tsx uses Zustand `activeTab` with conditional rendering: `{activeTab === "overview" && <StrategicOverview />}`, `{activeTab === "watchlist" && <WatchlistTab />}`, `{activeTab === "monitoring" && <MonitoringTab />}`. TabNavigation wired to `useDashboardStore`. No local `useState` found. |
| 2 | Watchlist table displays 12 tickers and Monitoring table displays 9 tickers, each with all specified columns and color-coded action signal badges | ✓ VERIFIED | StockTable.tsx has 9 columns (Symbol, 가격/1D%, 고가/낙폭, RS, MA50 이격도, Revision, FWD P/E, 전략 메모, 액션). WatchlistTab passes `defaultRows={12}` and uses `useWatchlist`. MonitoringTab passes `defaultRows={9}` and uses `useMonitoring`. ActionBadge renders color-coded Buy/Trim/Wait/Hold. |
| 3 | User can sort tables by RS strength and drawdown, search for symbols, and see RS/Revision color coding applied | ✗ FAILED | RS sort is wired via `<SortHeader field="rs">`. Symbol sort via `<SortHeader field="symbol">`. MA50 sort via `<SortHeader field="ma50Dist">`. **Drawdown sort is NOT exposed in the UI** — the "고가 / 낙폭" column header is a plain `<th>` (StockTable.tsx line 98), not a `<SortHeader field="drawdown">`. The sort logic exists in Zustand and StockTable filtering, but the user cannot trigger it. Search is wired via SearchBar → Zustand `searchQuery`. RS color coding (`getRsColor`) and RevisionBadge are applied. |
| 4 | Strategic Overview tab shows 7 market snapshot cards with values and directional indicators, macro threshold warnings when breached, and the Numerical Checklist with action signal summary | ✓ VERIFIED | MarketCards.tsx fetches from `useMarketData()`, renders all 6 market symbols + Fear & Greed card (7 total). Implements `isThresholdBreached` for `^TNX`/`DX-Y.NYB` and `isFearBreached` for score <= 30 with `border-amber-400 bg-amber-50`. ThresholdWarnings.tsx shows Korean "현재 {name}: {value} (임계치 {threshold} 돌파)" text. NumericalChecklist.tsx fetches `useWatchlist()` and renders ActionBadge per ticker. |
| 5 | Dashboard renders correctly on mobile with responsive layout, uses Korean UI labels, and follows the Premium Minimal Brutalism color palette with Lucide icons | ✓ VERIFIED | StockTable: `hidden md:block` for desktop table, `md:hidden` for mobile cards. Korean labels throughout (전략 개요, 워치리스트, 종목 검색..., 전략 메모, 낙폭, etc.). globals.css has `--color-brand-bg: #F8FAFC`, `--color-brand-primary: #1E293B`, `--color-brand-accent-orange: #EA580C`, `--color-brand-accent-blue: #2563EB`. Lucide icons used in every component (Target, TabNavigation uses brand-accent-blue active state, BookOpen, Calendar, ShieldAlert, Activity, ArrowUpRight, ArrowDownRight, AlertCircle, AlertTriangle, MousePointer2, etc.). |

**Score:** 4/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | Tailwind v4 brand color registration | ✓ VERIFIED | Contains `--color-brand-primary`, `--color-brand-bg`, `--color-brand-accent-orange`, `--color-brand-accent-blue`. No dark mode media query. |
| `src/lib/colors.ts` | ACTION_COLORS, REVISION_COLORS, utility functions | ✓ VERIFIED | Exports ACTION_COLORS, REVISION_COLORS, getRsColor, getMa50Color, getDrawdownColor, getChangeColor. Imports ActionSignal/Revision types. |
| `src/components/layout/Header.tsx` | Title + lastUpdated prop | ✓ VERIFIED | Exports `Header`, accepts `lastUpdated: string`, uses Target icon, `text-brand-primary`. |
| `src/components/layout/TabNavigation.tsx` | 3-tab nav wired to Zustand | ✓ VERIFIED | Imports `useDashboardStore`, Korean labels "전략 개요"/"워치리스트"/"모니터링 리스트", active state uses `bg-brand-accent-blue`. |
| `src/components/layout/MetricGuide.tsx` | Alpha Watchlist Manual legend | ✓ VERIFIED | Contains "Alpha Watchlist Manual", 4 metric descriptions in Korean, BookOpen icon. |
| `src/components/overview/SidePanel.tsx` | Opportunities & Risks panel | ✓ VERIFIED | Contains "Market Opportunities & Risks", static opportunities/risks arrays, ShieldAlert/TrendingUp/TrendingDown icons. |
| `src/components/overview/StrategicTimeline.tsx` | Economic events | ✓ VERIFIED | Contains "Strategic Timeline", static timeline entries, Calendar icon. |
| `src/components/ui/ActionBadge.tsx` | Buy/Trim/Wait/Hold colored badge | ✓ VERIFIED | Exports `ActionBadge`, imports ACTION_COLORS, accepts `action: ActionSignal`. |
| `src/components/ui/RevisionBadge.tsx` | UP/DOWN/NEUTRAL badge | ✓ VERIFIED | Exports `RevisionBadge`, imports REVISION_COLORS, accepts `revision: Revision`. |
| `src/components/ui/SearchBar.tsx` | Search wired to Zustand | ✓ VERIFIED | Imports `useDashboardStore`, calls `setSearchQuery`, placeholder "종목 검색...", Search icon. |
| `src/components/ui/SortHeader.tsx` | Sortable column header | ✓ VERIFIED | Imports `useDashboardStore`, calls `setSortConfig`, ArrowUp/ArrowDown/ArrowUpDown icons. |
| `src/components/tables/StockTable.tsx` | Shared table with 9 columns | ✓ VERIFIED (with gap) | 9 columns present including "전략 메모". Search/sort logic wired. Mobile card view wired. Drawdown column header is plain `<th>`, not SortHeader. |
| `src/components/tables/WatchlistTab.tsx` | Watchlist wrapper for 12 tickers | ✓ VERIFIED | Imports `useWatchlist`, passes data to StockTable with `defaultRows={12}`. |
| `src/components/tables/MonitoringTab.tsx` | Monitoring wrapper for 9 tickers | ✓ VERIFIED | Imports `useMonitoring`, passes data to StockTable with `defaultRows={9}`. |
| `src/components/overview/MarketCards.tsx` | 7 market cards with thresholds | ✓ VERIFIED | Imports `useMarketData`, `MACRO_THRESHOLDS`. Implements `isThresholdBreached` and `isFearBreached`. Renders `border-amber-400 bg-amber-50` when breached. |
| `src/components/overview/ThresholdWarnings.tsx` | Macro threshold warnings | ✓ VERIFIED | Imports `useMarketData`, `MACRO_THRESHOLDS`. Shows Korean text "현재 {name}: {value} (임계치 {threshold} 돌파)". Switches to red styling on breach. |
| `src/components/overview/NumericalChecklist.tsx` | Action signal summary | ✓ VERIFIED | Imports `useWatchlist`, `isFullItem` type guard, renders ActionBadge per ticker with Revision+RS condition text. |
| `src/components/overview/StrategicOverview.tsx` | Tab 1 layout container | ✓ VERIFIED | Imports and composes MarketCards, ThresholdWarnings, NumericalChecklist, SidePanel, StrategicTimeline. `lg:grid-cols-3` layout with `lg:col-span-2`. Static Executive Summary included. |
| `src/app/page.tsx` | Slim orchestrator | ✓ VERIFIED | 44 lines (reduced from 715). Imports `useDashboardStore` (no local useState). Renders MetricGuide, Header, TabNavigation, StrategicOverview, WatchlistTab, MonitoringTab conditionally. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| TabNavigation.tsx | store/dashboard.ts | useDashboardStore | WIRED | Line 2: `import { useDashboardStore }`. Line 11: `const { activeTab, setActiveTab } = useDashboardStore()`. |
| colors.ts | types/dashboard.ts | ActionSignal and Revision | WIRED | Line 1: `import type { ActionSignal, Revision } from "@/types/dashboard"`. |
| StockTable.tsx | store/dashboard.ts | useDashboardStore for searchQuery/sortConfig | WIRED | Line 3: `import { useDashboardStore }`. Line 43: `const { searchQuery, sortConfig } = useDashboardStore()`. |
| WatchlistTab.tsx | hooks/use-watchlist.ts | useWatchlist | WIRED | Line 4: `import { useWatchlist }`. Line 8: `const watchlist = useWatchlist()`. Passed to StockTable. |
| MonitoringTab.tsx | hooks/use-monitoring.ts | useMonitoring | WIRED | Line 3: `import { useMonitoring }`. Line 8: `const monitoring = useMonitoring()`. Passed to StockTable. |
| SearchBar.tsx | store/dashboard.ts | setSearchQuery | WIRED | Line 4: `import { useDashboardStore }`. Line 7: `const { searchQuery, setSearchQuery } = useDashboardStore()`. |
| MarketCards.tsx | hooks/use-market-data.ts | useMarketData | WIRED | Line 4: `import { useMarketData }`. Line 55: `const marketData = useMarketData()`. |
| MarketCards.tsx | lib/constants.ts | MACRO_THRESHOLDS | WIRED | Line 6: `import { MACRO_THRESHOLDS }`. Used in isThresholdBreached and isFearBreached. |
| ThresholdWarnings.tsx | hooks/use-market-data.ts | useMarketData | WIRED | Line 4: `import { useMarketData }`. Line 53: `const marketData = useMarketData()`. |
| page.tsx | store/dashboard.ts | useDashboardStore for activeTab | WIRED | Line 3: `import { useDashboardStore }`. Line 13: `const { activeTab } = useDashboardStore()`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| MarketCards.tsx | `marketData.data` | `useMarketData()` → `fetch("/api/market-data")` → `yahooFinance.quote()` + `fetchFearGreedIndex()` | Yes — Yahoo Finance API + Fear & Greed API, parallel fetch with partial failure tolerance | ✓ FLOWING |
| ThresholdWarnings.tsx | `marketData.data` (same hook) | Same as MarketCards | Yes | ✓ FLOWING |
| NumericalChecklist.tsx | `watchlist.data` | `useWatchlist()` → `fetch("/api/watchlist")` → `yahooFinance.quote()` per ticker | Yes — 12 tickers with quant metrics | ✓ FLOWING |
| WatchlistTab.tsx / StockTable.tsx | `data.data` (via props) | `useWatchlist()` → `/api/watchlist` | Yes — same real API route | ✓ FLOWING |
| MonitoringTab.tsx / StockTable.tsx | `data.data` (via props) | `useMonitoring()` → `fetch("/api/monitoring")` → `yahooFinance.quote()` per ticker | Yes — 9 tickers | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — no running server available for endpoint validation. API routes are real (yahoo-finance2 queries, not static returns). Runtime behavior requires human testing.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TAB1-02 | 02-03 | Market Snapshot 카드 7개 | ✓ SATISFIED | MarketCards renders 6 symbols + Fear & Greed card = 7 total |
| TAB1-03 | 02-03 | 각 카드에 현재값, 변동률, 방향 화살표 | ✓ SATISFIED | MarketCard renders `item.price`, `item.changePercent`, ArrowUpRight/ArrowDownRight |
| TAB1-04 | 02-03 | Macro Threshold Warnings | ✓ SATISFIED | ThresholdWarnings.tsx renders 3 thresholds with live values |
| TAB1-05 | 02-03 | 임계치 돌파 시 Amber/Red Alert UI | ✓ SATISFIED | isThresholdBreached/isFearBreached → border-amber-400 or bg-red-50 |
| TAB1-06 | 02-01 | Market Opportunities & Risks 사이드바 | ✓ SATISFIED | SidePanel.tsx renders opportunities and risks arrays |
| TAB1-07 | 02-01 | Strategic Timeline 경제 이벤트 | ✓ SATISFIED | StrategicTimeline.tsx renders static timeline entries |
| TAB1-08 | 02-03 | Numerical Checklist 액션 시그널 요약 | ✓ SATISFIED | NumericalChecklist.tsx renders ActionBadge per ticker with conditions |
| TAB2-01 | 02-02 | Watchlist 테이블 12개 종목 | ✓ SATISFIED | WatchlistTab passes defaultRows={12}, useWatchlist fetches 12 tickers |
| TAB2-02 | 02-02 | Monitoring List 9개 종목 | ✓ SATISFIED | MonitoringTab passes defaultRows={9}, useMonitoring fetches 9 tickers |
| TAB2-03 | 02-02 | 테이블 컬럼 9개 | ✓ SATISFIED | Symbol, 가격/1D%, 고가/낙폭, RS, MA50 이격도, Revision, FWD P/E, 전략 메모, 액션 |
| TAB2-04 | 02-02 | RS 강도순 및 낙폭순 정렬 | ✗ BLOCKED | RS sort works (SortHeader field="rs"). Drawdown sort: Zustand logic exists but no UI trigger in column header |
| TAB2-05 | 02-02 | 리스트 내 종목 검색 | ✓ SATISFIED | SearchBar → Zustand searchQuery → StockTable case-insensitive filter |
| TAB2-06 | 02-02 | RS 색상 코딩 | ✓ SATISFIED | getRsColor: >110 text-green-600, <90 text-red-600 |
| TAB2-07 | 02-02 | Revision UP/DOWN/NEUTRAL 색상 배지 | ✓ SATISFIED | RevisionBadge with REVISION_COLORS |
| DSGN-01 | 02-01 | Premium Minimal Brutalism | ✓ SATISFIED | Slate tones, clean borders, monospace numbers, card-based layout |
| DSGN-02 | 02-01 | 컬러 팔레트 | ✓ SATISFIED | globals.css: #F8FAFC bg, #1E293B primary, #EA580C orange, #2563EB blue |
| DSGN-03 | 02-01 | Alpha Watchlist Manual 상시 노출 | ✓ SATISFIED | MetricGuide rendered before tab navigation in page.tsx |
| DSGN-04 | 02-02 | 반응형 모바일 레이아웃 | ✓ SATISFIED | hidden md:block / md:hidden in StockTable; grid-cols-1 md:grid-cols-4 in MarketCards |
| DSGN-05 | 02-01, 02-02, 02-03 | 한국어 UI 라벨 | ✓ SATISFIED | Korean labels throughout: 전략 개요, 워치리스트, 종목 검색, 전략 메모, 낙폭, 이격도, etc. |
| DSGN-06 | 02-01, 02-02, 02-03 | Lucide-react 아이콘 | ✓ SATISFIED | Target, BookOpen, Calendar, ShieldAlert, Activity, Layers, Search, ArrowUpDown, ArrowUp, ArrowDown, ArrowUpRight, ArrowDownRight, AlertCircle, AlertTriangle, MousePointer2, BarChart3 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| src/components/tables/StockTable.tsx | 155 | `<td ... >-</td>` for Strategic Note column | ℹ️ Info | Intentional placeholder per D-09 spec; documented in SUMMARY as known stub |

No blocking anti-patterns found. The Strategic Note "-" placeholder is explicitly specified by D-09 and documented in 02-02-SUMMARY.md.

### Human Verification Required

### 1. Tab Navigation Visual State

**Test:** Click each tab button (전략 개요, 워치리스트, 모니터링 리스트) in sequence
**Expected:** Active tab shows `bg-brand-accent-blue text-white` highlight; content area switches correctly for each tab
**Why human:** Client-side Zustand state update and conditional JSX rendering requires browser execution

### 2. MarketCards Amber Border on Threshold Breach

**Test:** Wait until 10Y Yield >= 4.5 (or simulate via devtools) and observe the Yield card
**Expected:** Card border changes to `border-amber-400 bg-amber-50` styling; all other cards remain white
**Why human:** Threshold breach state depends on live market data values; cannot be triggered programmatically in static analysis

### 3. Mobile Responsive Card View

**Test:** Open dashboard on a mobile viewport (< 768px width) and navigate to Watchlist tab
**Expected:** Desktop table disappears; stacked cards appear showing Symbol+ActionBadge header and a 2x2 metrics grid (Price, RS, Drawdown, MA50 Dist)
**Why human:** Responsive CSS behavior requires browser/viewport testing

### Gaps Summary

One gap blocking full goal achievement:

**TAB2-04: Drawdown sort not exposed in UI**

The requirement specifies "RS 강도순 및 낙폭순 정렬 기능" (sorting by both RS strength and drawdown). The sort infrastructure is fully implemented: Zustand's `sortConfig` accepts `"drawdown"` as a field, and `StockTable.tsx`'s sort logic applies numeric subtraction for drawdown correctly. However, the "고가 / 낙폭" column header (line 98) is rendered as a plain `<th>` instead of `<SortHeader field="drawdown">`, so the user has no UI way to trigger drawdown sort. The fix is a single-line change in StockTable.tsx.

---

_Verified: 2026-04-12T14:00:00Z_
_Verifier: Claude (gsd-verifier)_
