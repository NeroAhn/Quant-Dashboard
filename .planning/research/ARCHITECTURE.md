# Architecture Patterns

**Domain:** Real-time Financial Quant Dashboard
**Researched:** 2026-04-12

## Recommended Architecture

```
[Yahoo Finance API]    [Gemini API]
        |                    |
        v                    v
+----------------------------------+
|  Next.js API Routes (BFF Layer)  |
|  /api/market-data                |
|  /api/watchlist                  |
|  /api/executive-summary          |
+----------------------------------+
        |
        v
+----------------------------------+
|  Quant Calculation Engine        |
|  (Server-side, in API routes)    |
|  RS, MA50 Dist, Drawdown,       |
|  Action Signals                  |
+----------------------------------+
        |
        v
+----------------------------------+
|  TanStack Query Cache Layer      |
|  (Client-side, 5-min polling)    |
+----------------------------------+
        |
        v
+----------------------------------+
|  Zustand UI State Store          |
|  (Active tab, filters, sort)     |
+----------------------------------+
        |
        v
+----------------------------------+
|  React Component Tree            |
|  TabLayout > Tab Panels >        |
|  Cards / Tables / Charts         |
+----------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **API Route: `/api/market-data`** | Fetch S&P500, NASDAQ, BTC, GOLD, 10Y, DXY from Yahoo Finance. Return normalized market snapshot. | Yahoo Finance (upstream), TanStack Query (downstream) |
| **API Route: `/api/watchlist`** | Fetch price data for all 21 tickers. Run quant engine. Return enriched ticker data with signals. | Yahoo Finance (upstream), Quant Engine (internal), TanStack Query (downstream) |
| **API Route: `/api/executive-summary`** | Send market context to Gemini API. Return 3-line summary. | Gemini API (upstream), TanStack Query (downstream) |
| **Quant Engine** (`lib/quant/`) | Pure functions: `calcRS()`, `calcMA50Dist()`, `calcDrawdown()`, `deriveSignal()`. No I/O. | Called by API routes only |
| **TanStack Query Layer** | Client-side cache, 5-min polling, background refetch, stale-while-revalidate. | API Routes (upstream), React Components (downstream) |
| **Zustand Store** | Active tab index, sort column/direction, filter state, search query. No server data. | React Components (bidirectional) |
| **Tab Layout Shell** | 3-tab navigation, renders active panel. | Zustand (reads active tab) |
| **Strategic Overview Panel** | Market Snapshot cards, Executive Summary, Macro Warnings, Timeline, Opportunities/Risks. | TanStack Query hooks |
| **Watchlist Panel** | Data table for 12 tickers with quant columns, action signals, sort/filter. | TanStack Query hooks, Zustand (sort/filter) |
| **Monitoring Panel** | Data table for 9 tickers, identical column structure to Watchlist. | TanStack Query hooks, Zustand (sort/filter) |

### Data Flow

```
1. Browser loads page
2. TanStack Query fires initial fetches to all 3 API endpoints
3. API Route /api/market-data:
   - yahoo-finance2.quote() for index/commodity tickers
   - Normalize response: { symbol, price, change, changePct }
   - Check macro thresholds (10Y > 4.5, DXY > 106, Fear < 30)
   - Return { snapshots[], warnings[] }

4. API Route /api/watchlist:
   - yahoo-finance2.quote() for 21 tickers (batched in one call)
   - yahoo-finance2.quoteSummary() for historicalData (MA50, 52wk high)
   - For each ticker:
     a. calcRS(tickerChange, spyChange)
     b. calcMA50Dist(price, ma50)
     c. calcDrawdown(price, high52w)
     d. deriveSignal(rs, ma50Dist, revision)
   - Return { tickers[], spyBenchmark }

5. API Route /api/executive-summary:
   - Compose prompt from market data
   - Call Gemini API
   - Return { lines: string[3] }

6. TanStack Query caches all responses
7. Components read from cache via hooks
8. Every 5 minutes: refetchInterval triggers re-fetch
9. User tab switches / sorts / filters update Zustand only (no refetch)
```

## Patterns to Follow

### Pattern 1: BFF Proxy with Server-Side Enrichment

**What:** API routes act as Backend-for-Frontend, fetching raw data, computing quant metrics, and returning UI-ready payloads. The client never talks to Yahoo Finance or Gemini directly.

**Why:** yahoo-finance2 cannot run in browser (CORS/cookie issues). Server-side calculation ensures consistent results. API keys stay server-side. Single request returns everything a component needs.

**Confidence:** HIGH (official yahoo-finance2 docs confirm server-only requirement)

**Example:**
```typescript
// app/api/watchlist/route.ts
import yahooFinance from 'yahoo-finance2';
import { calcRS, calcMA50Dist, calcDrawdown, deriveSignal } from '@/lib/quant';

export async function GET() {
  const symbols = [...WATCHLIST, ...MONITORING];
  const quotes = await yahooFinance.quote(symbols);
  const spy = await yahooFinance.quote('^GSPC');

  const enriched = quotes.map(q => {
    const rs = calcRS(q.regularMarketChangePercent, spy.regularMarketChangePercent);
    const ma50Dist = calcMA50Dist(q.regularMarketPrice, q.fiftyDayAverage);
    const drawdown = calcDrawdown(q.regularMarketPrice, q.fiftyTwoWeekHigh);
    const signal = deriveSignal({ rs, ma50Dist, revision: q.epsRevision });
    return { ...normalize(q), rs, ma50Dist, drawdown, signal };
  });

  return Response.json(enriched, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
  });
}
```

### Pattern 2: TanStack Query as the Single Source of Server State

**What:** All server data flows exclusively through TanStack Query hooks. No `useState` for API data. No prop drilling of fetched data.

**Why:** Automatic caching, deduplication, background refetch, loading/error states, and stale-while-revalidate -- all handled by one system.

**Confidence:** HIGH (TanStack Query official docs)

**Example:**
```typescript
// hooks/useMarketData.ts
export function useMarketData() {
  return useQuery({
    queryKey: ['market-data'],
    queryFn: () => fetch('/api/market-data').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: true, // keep updating even if tab unfocused
    staleTime: 4 * 60 * 1000, // data fresh for 4 min (avoid double-fetch)
  });
}

// hooks/useWatchlist.ts
export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => fetch('/api/watchlist').then(r => r.json()),
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 4 * 60 * 1000,
  });
}
```

### Pattern 3: Zustand for UI-Only State

**What:** Zustand manages tab selection, sort state, filter state, and search query. Kept completely separate from server data.

**Why:** Fine-grained subscriptions prevent unnecessary re-renders. No Context provider wrapping needed. ~1KB bundle. Tab switches and sort changes are instant with no server round-trip.

**Confidence:** HIGH (well-established pattern, community consensus in 2025-2026)

**Example:**
```typescript
// stores/dashboardStore.ts
import { create } from 'zustand';

interface DashboardState {
  activeTab: 'overview' | 'watchlist' | 'monitoring';
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  setActiveTab: (tab: DashboardState['activeTab']) => void;
  setSort: (column: string) => void;
  setSearch: (query: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'overview',
  sortColumn: 'rs',
  sortDirection: 'desc',
  searchQuery: '',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSort: (column) => set((s) => ({
    sortColumn: column,
    sortDirection: s.sortColumn === column && s.sortDirection === 'desc' ? 'asc' : 'desc',
  })),
  setSearch: (query) => set({ searchQuery: query }),
}));
```

### Pattern 4: Derived Data via useMemo (Not Extra State)

**What:** Sort, filter, and search are applied to TanStack Query data using `useMemo`. No copying server data into local state.

**Why:** Single source of truth. When cache updates, derived data recalculates automatically. No sync bugs.

**Example:**
```typescript
function WatchlistTable() {
  const { data: tickers } = useWatchlist();
  const { sortColumn, sortDirection, searchQuery } = useDashboardStore();

  const displayed = useMemo(() => {
    if (!tickers) return [];
    let result = tickers.filter(t => t.list === 'watchlist');
    if (searchQuery) result = result.filter(t =>
      t.symbol.includes(searchQuery.toUpperCase())
    );
    return result.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      return (a[sortColumn] - b[sortColumn]) * dir;
    });
  }, [tickers, sortColumn, sortDirection, searchQuery]);

  return <DataTable data={displayed} />;
}
```

### Pattern 5: Response-Level Cache Headers on API Routes

**What:** Set `Cache-Control: s-maxage=300, stale-while-revalidate=60` on API responses. Vercel's edge network caches responses at the CDN level.

**Why:** Even without TanStack Query polling, the CDN prevents Yahoo Finance from being hammered. Two layers of caching (CDN + client) provide resilience. The `stale-while-revalidate` window allows the CDN to serve stale data while fetching fresh data in the background.

**Confidence:** HIGH (Vercel/Next.js official caching docs)

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Quant Calculations

**What:** Running RS, MA50 Distance, Drawdown calculations in the browser.

**Why bad:** Requires sending raw historical data to the client (larger payloads). Calculation inconsistency across browser environments. Wastes client CPU on every re-render. Duplicates calculation logic if server also needs results.

**Instead:** Calculate everything server-side in API routes. Return pre-computed values. Client only displays.

### Anti-Pattern 2: Storing Server Data in Zustand

**What:** Fetching API data, then storing it in Zustand state.

**Why bad:** Creates two sources of truth (TanStack cache + Zustand). Manual sync required. Lose all TanStack benefits (background refetch, stale detection, deduplication).

**Instead:** TanStack Query owns ALL server data. Zustand owns ONLY UI state (tab, sort, filter).

### Anti-Pattern 3: Individual Ticker API Calls

**What:** Making one API call per ticker symbol.

**Why bad:** 21 separate requests hit Yahoo Finance rate limits immediately. 21 separate TanStack queries to manage. Waterfall loading pattern.

**Instead:** Batch all tickers into one API route call. yahoo-finance2's `quote()` accepts an array of symbols. One request, one cache entry.

### Anti-Pattern 4: Using SSR/RSC for Real-Time Data

**What:** Fetching market data in Server Components or during SSR.

**Why bad:** SSR data is stale the moment it reaches the client. No automatic refresh mechanism. Hydration mismatches when client-side polling returns different data.

**Instead:** Use client components with TanStack Query for all real-time data. SSR is fine for static elements (tab chrome, layout, labels).

### Anti-Pattern 5: Polling Each Tab Independently

**What:** Only fetching data when a tab becomes active.

**Why bad:** Switching tabs shows stale data or triggers loading states. User perception of slowness.

**Instead:** Fetch all data upfront. All queries poll on the same 5-minute interval regardless of active tab. Tab switching is instant because data is already cached.

## Component Architecture

```
app/
  layout.tsx              -- Root layout, QueryClientProvider, font, metadata
  page.tsx                -- Single-page app, renders <Dashboard />
  api/
    market-data/route.ts  -- Market snapshot endpoint
    watchlist/route.ts    -- All 21 tickers with quant metrics
    executive-summary/route.ts -- Gemini AI summary

components/
  dashboard/
    Dashboard.tsx         -- Top-level: TabNav + active TabPanel
    TabNav.tsx            -- 3-tab navigation bar
  overview/
    OverviewPanel.tsx     -- Strategic Overview tab content
    MarketSnapshotGrid.tsx -- Grid of 7 market cards
    MarketCard.tsx        -- Individual market metric card
    ExecutiveSummary.tsx  -- 3-line AI summary
    MacroWarnings.tsx     -- Threshold alert banners
    OpportunitiesRisks.tsx -- Sidebar panel
    StrategicTimeline.tsx -- Event timeline
  watchlist/
    WatchlistPanel.tsx    -- Watchlist tab content
    TickerTable.tsx       -- Reusable data table (shared with monitoring)
    TickerRow.tsx         -- Single ticker row
    ActionSignalBadge.tsx -- Buy/Hold/Wait/Trim badge
    SearchBar.tsx         -- Ticker search input
    SortHeader.tsx        -- Clickable sort column header
  monitoring/
    MonitoringPanel.tsx   -- Monitoring tab content (reuses TickerTable)
  shared/
    SkeletonCard.tsx      -- Loading skeleton for cards
    SkeletonTable.tsx     -- Loading skeleton for tables
    ThresholdBadge.tsx    -- Warning/normal badge
    NumberFormat.tsx      -- Percentage, currency formatting

lib/
  quant/
    index.ts             -- Exports all calculation functions
    rs.ts                -- Relative Strength calculation
    ma50.ts              -- MA50 Distance calculation
    drawdown.ts          -- Drawdown calculation
    signals.ts           -- Action signal derivation logic
  api/
    yahoo.ts             -- yahoo-finance2 wrapper with error handling
    gemini.ts            -- Gemini API client
  constants.ts           -- Ticker lists, thresholds, colors
  types.ts               -- TypeScript interfaces for all data shapes

hooks/
  useMarketData.ts       -- TanStack Query hook for market snapshot
  useWatchlist.ts        -- TanStack Query hook for ticker data
  useExecutiveSummary.ts -- TanStack Query hook for AI summary

stores/
  dashboardStore.ts      -- Zustand store for UI state
```

## Caching Strategy (Two-Layer)

| Layer | Mechanism | TTL | Purpose |
|-------|-----------|-----|---------|
| **CDN (Vercel Edge)** | `Cache-Control: s-maxage=300` on API responses | 5 min | Prevents multiple users from hitting Yahoo Finance. Even for single-user, prevents redundant serverless invocations. |
| **Client (TanStack Query)** | `staleTime: 240000`, `refetchInterval: 300000` | 4 min stale, 5 min refetch | Prevents UI jank. Shows cached data instantly. Background refetch is invisible to user. |

**Why staleTime < refetchInterval:** Data is marked stale at 4 minutes. If a component remounts (tab switch) after 4 min but before 5 min, it shows cached data immediately while refetching in background. At 5 min, polling triggers regardless.

## Scalability Considerations

| Concern | Current (1 user) | If Shared (10 users) | Notes |
|---------|-------------------|---------------------|-------|
| Yahoo Finance rate limits | ~12 requests/5min (safe) | CDN cache absorbs; still ~12 req/5min | s-maxage on Vercel means only 1 serverless invocation per cache window |
| Gemini API quota | 1 summary/5min | CDN cached; 1/5min regardless of users | Free tier sufficient |
| Client memory | ~21 tickers cached | Same per client | Negligible |
| Serverless cold starts | 1-2s first load | Vercel keeps warm if traffic steady | No mitigation needed for v1 |

## Suggested Build Order

Based on component dependencies:

```
Phase 1: Foundation
  lib/types.ts           -- All interfaces first (everything depends on types)
  lib/constants.ts       -- Ticker lists, thresholds
  lib/quant/*            -- Pure functions, unit-testable independently
  stores/dashboardStore  -- UI state store

Phase 2: Data Layer
  lib/api/yahoo.ts       -- Yahoo Finance wrapper
  app/api/watchlist/     -- Main data endpoint (uses quant engine)
  app/api/market-data/   -- Market snapshot endpoint
  hooks/useWatchlist.ts  -- TanStack Query hooks
  hooks/useMarketData.ts

Phase 3: Core UI
  components/dashboard/  -- Tab shell (Dashboard + TabNav)
  components/shared/     -- Skeleton loaders, badges, formatters
  components/watchlist/  -- TickerTable, TickerRow, ActionSignalBadge
  components/monitoring/ -- Reuses TickerTable

Phase 4: Overview Tab
  components/overview/   -- MarketSnapshotGrid, MarketCard
  MacroWarnings          -- Threshold-based alerts
  lib/api/gemini.ts      -- Gemini client
  app/api/executive-summary/
  ExecutiveSummary       -- AI-generated content

Phase 5: Polish
  SearchBar, SortHeader  -- Interactive features
  StrategicTimeline      -- Event timeline
  OpportunitiesRisks     -- Sidebar
  Responsive layout      -- Mobile adaptation
  Skeleton UI states     -- Loading experience
```

**Ordering rationale:**
- Types and quant engine are pure logic with zero dependencies -- build and test first.
- API routes require the quant engine -- build after Phase 1.
- TanStack Query hooks require API routes to exist -- build alongside or after.
- Tab shell and tables are the primary UI -- build before polish features.
- Gemini integration is isolated and non-critical -- defer to Phase 4.
- Search, sort, timeline are enhancements on working foundation -- Phase 5.

## Sources

- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- official docs on API route patterns
- [Next.js Backend for Frontend Guide](https://nextjs.org/docs/app/guides/backend-for-frontend) -- BFF proxy pattern
- [TanStack Query Polling](https://tanstack.com/query/latest/docs/framework/react/guides/polling) -- refetchInterval documentation
- [yahoo-finance2 npm](https://www.npmjs.com/package/yahoo-finance2) -- server-only requirement, batch API
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching) -- s-maxage and stale-while-revalidate
- [Zustand GitHub](https://github.com/pmndrs/zustand) -- UI state management
- [State Management in 2025](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k) -- Zustand for UI state recommendation
