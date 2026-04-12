# Phase 2: Dashboard UI - Research

**Researched:** 2026-04-12
**Domain:** React component architecture, Tailwind CSS v4, responsive financial data UI
**Confidence:** HIGH

## Summary

Phase 2 decomposes the existing 715-line monolithic `page.tsx` into a well-structured component tree, integrates the Zustand store (currently unused -- page.tsx uses local `useState`), adds sorting/search interactivity, implements dynamic Macro Threshold Warnings linked to live API data, adds the Strategic Note column, and ensures mobile responsiveness with card-view table transformation. All required libraries are already installed from Phase 1.

The codebase is in excellent shape for decomposition: TanStack Query hooks (`useWatchlist`, `useMonitoring`, `useMarketData`) are already functioning, the Zustand store has `activeTab`, `searchQuery`, and `sortConfig` defined with persist middleware, and skeleton components exist. The primary work is (1) extract components from page.tsx, (2) wire up Zustand instead of useState, (3) add sorting/search logic, (4) add Strategic Note column, (5) implement dynamic threshold comparison, and (6) add mobile card view.

**Primary recommendation:** Extract components following the D-01 directory structure, share a single `StockTable` component for both Watchlist and Monitoring (D-02), and connect to Zustand store for tab/search/sort state persistence.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Component directory structure: `layout/`, `overview/`, `tables/`, `ui/` under `src/components/`
- **D-02:** Single shared `StockTable` component for both Watchlist and Monitoring tables
- **D-03:** Static data (Executive Summary, Opportunities/Risks, Timeline) remains as placeholders; components extracted but data not changed
- **D-04:** Keep current card style (rounded-xl, shadow-sm, border) -- interpret Premium Minimal Brutalism as clean, professional, data-centric design
- **D-05:** PRD color palette strictly applied via Tailwind custom colors: Background #F8FAFC, Primary #1E293B, Accent #EA580C/#2563EB, Up=Green, Down=Red, Warning=Amber/Red
- **D-06:** Mobile tables transform to card view for readability
- **D-07:** Column header click sorting with arrow icon direction indicator, persisted via Zustand sortConfig across tab switches
- **D-08:** Search bar at top of each table, symbol filtering, persisted via Zustand searchQuery across tab switches
- **D-09:** Strategic Note column added (TAB2-03) -- display '-' or empty, structural placeholder for future AI/manual input
- **D-10:** Threshold breach changes Market Card border/background to Amber/Red; Threshold Warnings section shows active state
- **D-11:** Threshold Warnings show actual API values with static descriptions, e.g., "Current 10Y Yield: 4.62% (threshold 4.5% breached)"

### Claude's Discretion
- StockTable mobile card view detail layout (which fields to prioritize)
- Overview tab responsive breakpoint fine-tuning
- Skeleton UI component extension details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAB1-02 | Market Snapshot 7 cards (S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY, Fear & Greed) | Existing `useMarketData` hook + `MarketDataItem` type already provide data. Extract to `MarketCards` component. |
| TAB1-03 | Each card: current value, change %, directional arrow | Already implemented in page.tsx with ArrowUpRight/ArrowDownRight. Extract to `MarketCard` sub-component. |
| TAB1-04 | Macro Threshold Warnings (10Y 4.5%, DXY 106.0, Fear 30 or below) | `MACRO_THRESHOLDS` in constants.ts. Compare against `useMarketData` response. |
| TAB1-05 | Amber/Red Alert UI on threshold breach | D-10/D-11 decision: dynamic border/background color on cards + warnings section. |
| TAB1-06 | Market Opportunities & Risks sidebar | Existing static data in page.tsx. Extract to `SidePanel` component. |
| TAB1-07 | Strategic Timeline with economic events | Existing static data. Extract to `StrategicTimeline` component. |
| TAB1-08 | Numerical Checklist with action signal summary | Existing in page.tsx. Extract to `NumericalChecklist` component with watchlistItems data. |
| TAB2-01 | Watchlist table with 12 tickers | `useWatchlist` hook returns 12 items. Render via shared `StockTable`. |
| TAB2-02 | Monitoring table with 9 tickers | `useMonitoring` hook returns 9 items. Render via shared `StockTable`. |
| TAB2-03 | Table columns: Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note | Current tables have 8 columns minus Strategic Note. Add Strategic Note column per D-09. |
| TAB2-04 | Sort by RS strength and drawdown | Zustand `sortConfig` with `setSortConfig` already defined. Wire to table headers. |
| TAB2-05 | Symbol search within list | Zustand `searchQuery` with `setSearchQuery` already defined. Wire to search bar. |
| TAB2-06 | RS > 110 green, RS < 90 red color coding | Already implemented in page.tsx. Preserve in extracted component. |
| TAB2-07 | Revision UP/DOWN/NEUTRAL color badges | Already implemented with `REVISION_COLORS`. Preserve in extracted component. |
| DSGN-01 | Premium Minimal Brutalism design identity | D-04: current style IS the interpretation. Maintain rounded-xl, shadow-sm, border pattern. |
| DSGN-02 | Color palette: Background #F8FAFC, Primary #1E293B, Accent #EA580C/#2563EB | D-05: register as Tailwind custom colors in globals.css @theme block. |
| DSGN-03 | Alpha Watchlist Manual legend always visible at top | Already implemented as MetricGuide section in page.tsx. Extract to `MetricGuide` component. |
| DSGN-04 | Responsive mobile layout | D-06: tables become card views on mobile. Use Tailwind responsive breakpoints. |
| DSGN-05 | Korean UI labels and descriptions | Current page.tsx has mixed Korean/English. Standardize to Korean. |
| DSGN-06 | Lucide-react icons | Already used throughout. Maintain pattern. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech Stack**: Next.js 15.x + Tailwind CSS v4 + Lucide-react + TanStack Query v5 + Zustand v5
- **No Tailwind UI / DaisyUI** -- build from Tailwind utilities directly
- **No Axios** -- use native fetch
- **No SWR** -- TanStack Query only
- **yahoo-finance2 server-side only** -- this phase is client-side UI only, no data layer changes
- **@google/genai NOT @google/generative-ai** -- not relevant to Phase 2 but noted
- **Recharts** for charting (not used in Phase 2 but available)

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| Next.js | 15.5.15 | App Router, page routing | Installed [VERIFIED: package.json] |
| React | 19.1.0 | UI rendering | Installed [VERIFIED: package.json] |
| Tailwind CSS | ^4 | Utility-first styling, v4 CSS-first config | Installed [VERIFIED: package.json] |
| Lucide React | ^1.8.0 | Icons | Installed [VERIFIED: package.json] |
| Zustand | ^5.0.12 | Client state (tab, search, sort) | Installed [VERIFIED: package.json] |
| @tanstack/react-query | ^5.99.0 | Server state, polling | Installed [VERIFIED: package.json] |

### No Additional Packages Needed
Phase 2 is purely a UI decomposition and enhancement phase. All required libraries are already installed. No new `npm install` commands needed.

## Architecture Patterns

### Target Component Structure (from D-01)
```
src/
├── app/
│   └── page.tsx              # Slim orchestrator -- imports tab components
├── components/
│   ├── layout/
│   │   ├── Header.tsx        # Title, subtitle, last-updated timestamp
│   │   ├── TabNavigation.tsx  # 3-tab switcher wired to Zustand
│   │   └── MetricGuide.tsx   # Alpha Watchlist Manual legend
│   ├── overview/
│   │   ├── StrategicOverview.tsx  # Tab 1 container (layout grid)
│   │   ├── MarketCards.tsx        # 7 market snapshot cards
│   │   ├── ThresholdWarnings.tsx  # Dynamic macro warnings
│   │   ├── NumericalChecklist.tsx # Action signal summary table
│   │   └── SidePanel.tsx          # Opportunities, Risks, Timeline
│   ├── tables/
│   │   ├── StockTable.tsx    # Shared table component (D-02)
│   │   ├── WatchlistTab.tsx  # Wrapper: passes 12 tickers + metadata
│   │   └── MonitoringTab.tsx # Wrapper: passes 9 tickers + metadata
│   └── ui/
│       ├── ActionBadge.tsx   # Buy/Trim/Wait/Hold colored badge
│       ├── RevisionBadge.tsx # UP/DOWN/NEUTRAL colored badge
│       ├── SearchBar.tsx     # Symbol search input
│       └── SortHeader.tsx    # Sortable column header with arrow
├── lib/
│   └── colors.ts             # ACTION_COLORS, REVISION_COLORS constants (moved from page.tsx)
└── store/
    └── dashboard.ts          # Already exists -- no changes needed
```

### Pattern 1: Shared StockTable Component (D-02)

**What:** A single table component that renders both Watchlist and Monitoring data.
**When to use:** Both tabs share identical column structure and behavior.
**Example:**
```typescript
// Source: D-02 decision, derived from existing page.tsx pattern
interface StockTableProps {
  items: WatchlistItem[];
  title: string;
  description: string;
  icon: React.ReactNode;
  isPending: boolean;
  error: Error | null;
}

function StockTable({ items, title, description, icon, isPending, error }: StockTableProps) {
  const { searchQuery, sortConfig, setSortConfig } = useDashboardStore();

  const filtered = items.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortConfig.direction === "asc" ? 1 : -1;
    return (a[sortConfig.field] - b[sortConfig.field]) * mul;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">{icon}{title}</h2>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <SearchBar />
      </div>
      {isPending && <div className="p-6"><TableSkeleton rows={items.length || 12} /></div>}
      {error && <p className="p-6 text-red-500">Error: {error.message}</p>}
      {/* Desktop: table, Mobile: card view */}
      {sorted.length > 0 && (
        <>
          <DesktopTable items={sorted} />
          <MobileCardList items={sorted} />
        </>
      )}
    </div>
  );
}
```

### Pattern 2: Zustand Store Integration (replacing useState)

**What:** Replace page.tsx's local `useState<Tab>` with Zustand store's `activeTab`.
**Why:** The Zustand store already has `activeTab`, `searchQuery`, `sortConfig` with persist middleware. The current page.tsx uses `useState` instead, meaning tab state is lost on refresh.
**Example:**
```typescript
// Current (page.tsx line 97):
const [activeTab, setActiveTab] = useState<Tab>("overview");

// Target:
const { activeTab, setActiveTab } = useDashboardStore();
```

### Pattern 3: Dynamic Threshold Comparison (D-10, D-11)

**What:** Compare live `useMarketData()` values against `MACRO_THRESHOLDS` to determine alert state.
**Example:**
```typescript
// Source: D-10/D-11 decisions + constants.ts MACRO_THRESHOLDS
interface ThresholdStatus {
  name: string;
  threshold: number;
  currentValue: number | null;
  breached: boolean;
  comment: string;
}

function getThresholdStatuses(marketData: MarketDataResponse): ThresholdStatus[] {
  const yieldItem = marketData.data.find(d => d.symbol === "^TNX");
  const dxyItem = marketData.data.find(d => d.symbol === "DX-Y.NYB");
  const fearScore = marketData.fearGreed?.score ?? null;

  return [
    {
      name: "10Y Yield",
      threshold: MACRO_THRESHOLDS.YIELD_10Y_WARNING,
      currentValue: yieldItem?.price ?? null,
      breached: yieldItem?.price != null && yieldItem.price >= MACRO_THRESHOLDS.YIELD_10Y_WARNING,
      comment: "...",
    },
    {
      name: "DXY Index",
      threshold: MACRO_THRESHOLDS.DXY_WARNING,
      currentValue: dxyItem?.price ?? null,
      breached: dxyItem?.price != null && dxyItem.price >= MACRO_THRESHOLDS.DXY_WARNING,
      comment: "...",
    },
    {
      name: "Fear Index",
      threshold: MACRO_THRESHOLDS.FEAR_GREED_WARNING,
      currentValue: fearScore,
      breached: fearScore != null && fearScore <= MACRO_THRESHOLDS.FEAR_GREED_WARNING,
      comment: "...",
    },
  ];
}
```

### Pattern 4: Tailwind v4 Custom Colors (D-05)

**What:** Register PRD color palette in globals.css using Tailwind v4's CSS-first config.
**Example:**
```css
/* globals.css -- Tailwind v4 CSS-first configuration */
@import "tailwindcss";

@theme inline {
  --color-brand-bg: #F8FAFC;
  --color-brand-primary: #1E293B;
  --color-brand-accent-orange: #EA580C;
  --color-brand-accent-blue: #2563EB;
}
```
Usage: `className="text-brand-primary bg-brand-bg"` [VERIFIED: Tailwind v4 uses @theme for custom values, no tailwind.config.js needed]

### Pattern 5: Mobile Card View (D-06)

**What:** On small screens, hide the table and show a card-based layout.
**Example:**
```typescript
// Desktop table: hidden on mobile
<div className="hidden md:block">
  <table>...</table>
</div>

// Mobile cards: hidden on desktop
<div className="md:hidden space-y-3 p-4">
  {items.map(item => (
    <div key={item.symbol} className="bg-white rounded-xl border p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm">{item.symbol}</span>
        <ActionBadge action={item.action} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><span className="text-slate-400">Price</span> <span className="font-mono">${item.price}</span></div>
        <div><span className="text-slate-400">RS</span> <span className={rsColor(item.rs)}>{item.rs.toFixed(1)}</span></div>
        <div><span className="text-slate-400">Drawdown</span> <span>{item.drawdown.toFixed(2)}%</span></div>
        <div><span className="text-slate-400">MA50</span> <span>{item.ma50Dist.toFixed(2)}%</span></div>
      </div>
    </div>
  ))}
</div>
```
**Mobile priority fields (Claude's discretion):** Symbol + Action badge as header row, then Price, RS, Drawdown, MA50 Dist in a 2-column grid. Secondary fields (Revision, FWD P/E, High, Strategic Note) in a collapsible or smaller section below.

### Anti-Patterns to Avoid
- **Prop drilling through many layers:** Use Zustand for cross-cutting state (activeTab, searchQuery, sortConfig) instead of passing through 3+ component levels. [ASSUMED]
- **Duplicating table code:** D-02 explicitly forbids this. One StockTable, two wrappers.
- **Hardcoding color strings:** Move ACTION_COLORS, REVISION_COLORS to `src/lib/colors.ts` and import everywhere. Currently defined in page.tsx and will be lost on decomposition.
- **Inline sorting logic:** Extract sorting/filtering into a reusable utility or keep in StockTable. Don't re-implement in each tab wrapper.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sort arrow icons | Custom SVG arrows | `ArrowUpDown`, `ArrowUp`, `ArrowDown` from Lucide | Already in Lucide, tree-shaken [VERIFIED: lucide-react docs] |
| Color coding logic | Inline ternary chains | Utility functions: `getRsColor(rs)`, `getDrawdownColor(dd)` | Existing page.tsx has inline ternaries in 4+ places -- extract once, reuse |
| Search debounce | Custom setTimeout wrapper | Zustand's `setSearchQuery` direct (no debounce needed for <21 items) | Dataset is tiny (12+9 items), instant filtering is fine [ASSUMED] |

**Key insight:** With only 21 total tickers, client-side filtering and sorting is trivially fast. No need for virtualization, debouncing, or server-side search. Keep it simple.

## Common Pitfalls

### Pitfall 1: Zustand Hydration Mismatch with SSR
**What goes wrong:** Next.js server-renders with Zustand's initial state, but client loads persisted state from localStorage, causing hydration mismatch warnings.
**Why it happens:** `persist` middleware restores state asynchronously after hydration.
**How to avoid:** Use Zustand's `onRehydrateStorage` callback or suppress hydration warnings on the specific components. Alternatively, ensure page.tsx has `"use client"` directive (already present) and accept the brief flash. Since this is a data dashboard, the flash is acceptable.
**Warning signs:** Console warnings about hydration mismatches on `activeTab` or `searchQuery` values. [VERIFIED: known Zustand persist + Next.js SSR pattern]

### Pitfall 2: Sort Field Type Safety
**What goes wrong:** `sortConfig.field` allows "symbol" but symbol is a string, while rs/drawdown/ma50Dist are numbers. Sorting logic must handle both types.
**Why it happens:** The Zustand store defines `SortField = "rs" | "drawdown" | "ma50Dist" | "symbol"`.
**How to avoid:** Use `localeCompare` for string fields, numeric subtraction for number fields.
**Warning signs:** All items appear in wrong/random order when sorting by symbol. [VERIFIED: dashboard.ts line 5]

### Pitfall 3: Market Data Symbol Matching for Threshold Comparison
**What goes wrong:** Looking up market data by display name ("10Y Yield") instead of Yahoo symbol ("^TNX") or vice versa.
**Why it happens:** `MARKET_SYMBOLS` maps name->symbol, but `MarketDataItem` has both `name` and `symbol` fields.
**How to avoid:** Always match by `symbol` field (the Yahoo Finance ticker), not by display name. [VERIFIED: constants.ts MARKET_SYMBOLS + types/dashboard.ts MarketDataItem]

### Pitfall 4: isFullItem Filter Must Be Preserved
**What goes wrong:** Rendering a partial error item (`{ symbol, error }`) as if it were a full `WatchlistItem`, causing runtime errors on `.price`, `.rs`, etc.
**Why it happens:** The API returns a union type: `WatchlistItem | { symbol: string; error: string }`.
**How to avoid:** Keep the `isFullItem` type guard and apply it before passing data to StockTable. [VERIFIED: page.tsx line 90-94, types/dashboard.ts line 16]

### Pitfall 5: Korean Locale for Number Formatting
**What goes wrong:** Using `toFixed()` alone produces English-format numbers. Korean users may expect consistent locale-aware formatting.
**Why it happens:** DSGN-05 requires Korean UI labels but financial numbers are typically displayed in English format globally.
**How to avoid:** Keep number formatting in English (standard for financial data: `$123.45`, `+2.34%`). Only translate UI labels, headers, and descriptions to Korean. [ASSUMED -- standard practice for Korean financial dashboards]

## Code Examples

### Sortable Column Header
```typescript
// SortHeader.tsx
"use client";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard";

type SortField = "rs" | "drawdown" | "ma50Dist" | "symbol";

interface SortHeaderProps {
  field: SortField;
  label: string;
}

export function SortHeader({ field, label }: SortHeaderProps) {
  const { sortConfig, setSortConfig } = useDashboardStore();
  const isActive = sortConfig.field === field;

  return (
    <th
      className="px-6 py-4 cursor-pointer select-none hover:bg-slate-200 transition-colors"
      onClick={() => setSortConfig(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortConfig.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="text-slate-300" />
        )}
      </span>
    </th>
  );
}
```

### Action Badge Component
```typescript
// ActionBadge.tsx
import type { ActionSignal } from "@/types/dashboard";

const ACTION_COLORS: Record<ActionSignal, string> = {
  Buy: "bg-green-100 text-green-700",
  Trim: "bg-orange-100 text-orange-700",
  Wait: "bg-red-100 text-red-700",
  Hold: "bg-slate-100 text-slate-600",
};

export function ActionBadge({ action }: { action: ActionSignal }) {
  return (
    <span className={`text-[10px] px-2 py-1 rounded font-bold ${ACTION_COLORS[action]}`}>
      {action}
    </span>
  );
}
```

### Threshold-Aware Market Card
```typescript
// MarketCards.tsx (partial -- threshold highlighting)
import { MACRO_THRESHOLDS } from "@/lib/constants";

function isThresholdBreached(symbol: string, price: number | null): boolean {
  if (price == null) return false;
  if (symbol === "^TNX") return price >= MACRO_THRESHOLDS.YIELD_10Y_WARNING;
  if (symbol === "DX-Y.NYB") return price >= MACRO_THRESHOLDS.DXY_WARNING;
  return false;
}

// In render:
<div className={`p-4 rounded-xl border shadow-sm ${
  isThresholdBreached(item.symbol, item.price)
    ? "border-amber-400 bg-amber-50"
    : "border-slate-200 bg-white"
}`}>
```

### Search Bar
```typescript
// SearchBar.tsx
"use client";
import { Search } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useDashboardStore();

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="종목 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
      />
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js | @theme in CSS (Tailwind v4) | Jan 2025 | Custom colors defined in globals.css, no JS config file [VERIFIED: project uses Tailwind v4] |
| Zustand v4 Provider pattern | Zustand v5 no Provider needed | 2024 | Store imports directly, no wrapper component [VERIFIED: package.json zustand ^5.0.12] |
| React Context for global state | Zustand persist | Current | Tab/search/sort state survives page refresh via localStorage [VERIFIED: dashboard.ts uses persist middleware] |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | No search debounce needed for 21 items | Don't Hand-Roll | Negligible -- worst case add debounce later |
| A2 | Financial numbers stay in English format even with Korean UI | Pitfall 5 | Low -- user may want Korean number formatting, easy to adjust |
| A3 | Prop drilling anti-pattern applies here | Anti-Patterns | Low -- small app, but Zustand already solves this |

## Open Questions

1. **Korean label translations for all column headers**
   - What we know: DSGN-05 requires Korean labels. Current page.tsx has English headers ("Symbol", "Price / 1D %", etc.)
   - What's unclear: Exact Korean translations for financial column headers (does user prefer "심볼" vs "종목코드", "상대강도" vs "RS" etc.)
   - Recommendation: Use Korean labels with English abbreviations in parentheses where standard (e.g., "RS (상대강도)", "MA50 이격도"). Financial abbreviations like RS, MA50, P/E are universal and should stay in English.

2. **Fear & Greed threshold direction**
   - What we know: MACRO_THRESHOLDS.FEAR_GREED_WARNING = 30. "30 이하" means score <= 30 triggers warning.
   - What's unclear: Should the Fear & Greed market card also change border color (like 10Y Yield and DXY)?
   - Recommendation: Yes, apply same amber/red border treatment for consistency with D-10.

## Sources

### Primary (HIGH confidence)
- `package.json` -- verified all dependency versions installed
- `src/app/page.tsx` -- 715 lines of existing UI code to decompose
- `src/store/dashboard.ts` -- Zustand store with activeTab, searchQuery, sortConfig
- `src/types/dashboard.ts` -- WatchlistItem, MarketDataItem, FearGreedData types
- `src/lib/constants.ts` -- MACRO_THRESHOLDS, QUANT_THRESHOLDS, ticker lists
- `src/components/skeleton.tsx` -- existing MarketCardSkeleton, TableSkeleton
- `src/hooks/use-watchlist.ts` -- TanStack Query hook pattern with getStockRefetchInterval
- `.planning/phases/02-dashboard-ui/02-CONTEXT.md` -- all D-01 through D-11 decisions

### Secondary (MEDIUM confidence)
- Tailwind CSS v4 @theme syntax -- verified against project's existing globals.css usage
- Zustand v5 persist middleware hydration behavior -- known pattern from documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed and verified in package.json
- Architecture: HIGH -- component structure locked by D-01, existing code patterns clear
- Pitfalls: HIGH -- identified from direct codebase analysis (type guards, symbol matching, hydration)

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable -- no external dependency changes expected)
