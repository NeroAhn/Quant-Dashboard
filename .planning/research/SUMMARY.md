# Project Research Summary

**Project:** Quant Strategist Pro Dashboard (Alpha Engine)
**Domain:** Real-time financial quant dashboard
**Researched:** 2026-04-12
**Confidence:** HIGH

## Executive Summary

This is a single-user, real-time financial dashboard built with Next.js that fetches market data from Yahoo Finance, computes quantitative signals (Relative Strength, MA50 Distance, Drawdown), and generates AI-powered market summaries via Gemini API. Experts build this type of tool as a BFF (Backend-for-Frontend) architecture where all data fetching and computation happens server-side in API routes, with the client acting purely as a display and interaction layer. The stack is well-established: Next.js 15, TanStack Query for polling, Zustand for UI state, Tailwind CSS v4 for a custom "Premium Minimal Brutalism" design, and Recharts for lightweight visualization.

The recommended approach is to build the data pipeline and quant engine first, then layer the UI on top, and finally integrate Gemini AI as an enhancement. This order is driven by hard dependencies: the tables and cards cannot render without computed data, and AI summaries are a differentiator, not a table-stakes feature. The entire data layer must flow through Next.js API routes because yahoo-finance2 is server-only (CORS/cookie constraints make browser-side calls impossible).

The two dominant risks are Yahoo Finance API instability (unofficial API with no SLA, known rate limiting at ~360 req/hour, subject to breakage without warning) and Gemini free-tier quota exhaustion (250 requests/day on Flash, easily exceeded by naive 5-minute polling). Both require defensive architecture from day one: aggressive server-side caching, circuit breakers for Yahoo, and on-demand or 30-minute generation intervals for Gemini. A third risk -- floating-point arithmetic corrupting threshold-based signals -- is easily prevented with consistent rounding and hysteresis but will cause incorrect Buy/Sell signals if ignored.

## Key Findings

### Recommended Stack

The stack is mature and high-confidence. Next.js 15 (not 16 -- Turbopack defaults are still maturing) provides the full-stack framework with Route Handlers as the BFF layer. All dependencies are actively maintained with strong community adoption.

**Core technologies:**
- **Next.js 15 + React 19 + TypeScript 5:** Full-stack framework with API routes acting as BFF proxy to Yahoo Finance and Gemini. TypeScript is non-negotiable for financial calculation correctness.
- **yahoo-finance2 ^3.14:** The only maintained Node.js Yahoo Finance library (43K weekly downloads). Server-side only. No API key required. Provides quote, quoteSummary, and historical methods.
- **@google/genai ^1.48 (NOT @google/generative-ai):** New official Google GenAI SDK (GA since May 2025). The old SDK is deprecated with EOL August 2025. Use Gemini 2.5 Flash or Flash-Lite for summaries.
- **TanStack Query v5:** Server state management with 5-minute polling via refetchInterval. Handles caching, background refetch, loading/error states.
- **Zustand v5:** Lightweight client-side state for tabs, sort, filters. Keeps UI state completely separate from server data.
- **Tailwind CSS v4 + Recharts v3 + Lucide React:** Styling, charting, and icons. Tailwind v4 is stable with CSS-first config. Recharts provides declarative SVG charts without D3 complexity.

### Expected Features

**Must have (table stakes):**
- Market Snapshot Cards (S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY) with 5-min refresh
- Watchlist Table (12 tickers) and Monitoring Table (9 tickers) with all quant columns
- Quant Signal Calculations: RS, MA50 Distance, Drawdown -- computed server-side
- Action Signal Generation: Buy/Hold/Wait/Trim based on mechanical rules
- Table sorting with visual indicators
- Tab navigation (Strategic Overview / Watchlist / Monitoring)
- Skeleton loading states and data freshness indicator
- Responsive mobile layout with horizontal scroll on tables

**Should have (differentiators):**
- AI Executive Summary (3-line Gemini-generated market brief) -- the standout feature
- Macro Threshold Warnings (10Y >4.5%, DXY >106, Fear <30) -- proactive alerting
- Alpha Watchlist Manual (indicator guide) -- low effort, high clarity value

**Defer (v2+):**
- Market Opportunities & Risks Sidebar -- depends on AI integration maturity
- Strategic Timeline / Economic Calendar -- requires separate data source
- Numerical Checklist / Action Matrix -- useful but redundant with clear Action Signals
- Table Filtering and Symbol Search -- sorting alone handles 21 symbols
- Dynamic Watchlist CRUD, authentication, database, dark mode -- explicitly anti-features for v1

### Architecture Approach

The architecture follows a clean BFF proxy pattern with two-layer caching (Vercel CDN + TanStack Query client cache). Three API routes handle distinct concerns: `/api/market-data` for macro indices, `/api/watchlist` for all 21 tickers with computed quant metrics, and `/api/executive-summary` for Gemini AI. The quant engine lives in `lib/quant/` as pure functions with zero I/O, making them independently testable. The client never touches yahoo-finance2 or Gemini directly.

**Major components:**
1. **API Routes (BFF Layer)** -- Server-side data fetching, quant calculation, response caching via Cache-Control headers
2. **Quant Engine (`lib/quant/`)** -- Pure functions: calcRS, calcMA50Dist, calcDrawdown, deriveSignal. No side effects.
3. **TanStack Query Cache Layer** -- Client-side polling at 5-min intervals, stale-while-revalidate, background refetch
4. **Zustand UI Store** -- Active tab, sort column/direction, search query, threshold config. No server data.
5. **React Component Tree** -- Tab Layout > Panel Components > Cards/Tables/Charts. Derived data via useMemo, not extra state.

### Critical Pitfalls

1. **Yahoo Finance API instability** -- Unofficial API with no SLA. Rate limits at ~360 req/hour. Can change endpoints or block IPs without warning. Mitigate: batch all 21 tickers into single quote() call, cache for full 5-min interval, implement circuit breaker (3 failures = 10-min backoff), design a provider abstraction layer for future swap to Alpha Vantage/Finnhub.

2. **Gemini free-tier quota exhaustion** -- 250 requests/day on Flash. Naive 5-min polling = 288 calls/day (exceeds limit). Mitigate: generate summaries every 30-60 minutes (not every 5 min), consider Flash-Lite (1000 RPD), cache aggressively, graceful degradation showing last known summary.

3. **Floating-point corruption of action signals** -- JS float math produces values like 109.9999 instead of 110, causing wrong Buy/Hold signals at threshold boundaries. Mitigate: round all intermediates to 2 decimal places, add hysteresis bands to threshold comparisons (e.g., activate at 109.5, deactivate at 110.5), unit test boundary values extensively.

4. **Stale data displayed as fresh** -- TanStack Query serves cached data silently when refetch fails. User sees hours-old prices during volatile markets. Mitigate: prominent "Last Updated" timestamp with amber/red indicators, track Yahoo's regularMarketTime (not just fetch time), disable polling when market is closed.

5. **Vercel serverless timeout** -- Hobby plan limits functions to 10 seconds. Batching 21 tickers + quant calculations can exceed this. Mitigate: separate API routes by concern, use Promise.all for parallel fetches, set 5-second abort controllers on Yahoo calls.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation and Data Pipeline
**Rationale:** Everything depends on types, constants, and the quant engine. The API routes depend on the quant engine. The UI depends on API routes. This must come first.
**Delivers:** TypeScript interfaces, ticker/threshold constants, quant calculation functions (RS, MA50 Dist, Drawdown, Action Signal), Yahoo Finance wrapper with error handling, `/api/market-data` and `/api/watchlist` endpoints, TanStack Query hooks with polling config.
**Addresses:** Quant Signal Calculation, Yahoo Finance API integration
**Avoids:** Yahoo API instability (via caching + circuit breaker), float precision errors (via rounding + hysteresis), CORS issues (via server-side only), mismatched RS periods (via batched fetch including ^GSPC), serverless timeout (via separated routes + parallel fetch)

### Phase 2: Core UI (Tables and Navigation)
**Rationale:** With the data pipeline working, build the primary interaction surfaces. Tables are the core value delivery -- they show the quant signals and action recommendations.
**Delivers:** Tab navigation shell, Watchlist table with all columns, Monitoring table (reuses component), Action Signal badges (Buy/Hold/Wait/Trim), table sorting, Zustand store for UI state, skeleton loading states.
**Addresses:** Watchlist Table, Monitoring Table, Tab Navigation, Table Sorting, Skeleton UI, Action Signal display
**Avoids:** Storing server data in Zustand (anti-pattern), polling each tab independently (fetch all upfront), skeleton persisting on failure (max display time + error states)

### Phase 3: Strategic Overview and Market Cards
**Rationale:** The Overview tab is the "morning brief" landing page. Market cards are visually simple but require the data pipeline from Phase 1. Group with macro threshold warnings since they use the same data.
**Delivers:** Market Snapshot card grid (7 cards), macro threshold warning banners, data freshness indicator, market open/closed status, Fear & Greed Index display.
**Addresses:** Market Snapshot Cards, Fear & Greed Index, Macro Threshold Warnings, Data Freshness Indicator
**Avoids:** Stale data displayed as fresh (via prominent timestamps + staleness indicators), market hours confusion (via timezone-aware status)

### Phase 4: AI Intelligence Layer
**Rationale:** Gemini integration is the standout differentiator but is isolated from core functionality. Defer until the dashboard works fully without AI. Quota-sensitive design must be baked in from the start of this phase.
**Delivers:** Gemini API client, `/api/executive-summary` endpoint, Executive Summary component (3-line brief), 30-minute generation interval with caching, graceful degradation on quota exhaustion.
**Addresses:** AI Executive Summary, Alpha Watchlist Manual (static content, low effort)
**Avoids:** Gemini quota exhaustion (via 30-min intervals + Flash-Lite option + caching)

### Phase 5: Polish and Responsive Design
**Rationale:** Enhancement features that improve the experience but are not critical for launch. Mobile responsiveness is applied as a CSS layer across all existing components.
**Delivers:** Responsive mobile layout (Tailwind breakpoints), horizontal table scroll with sticky symbol column, sparkline charts (Recharts), symbol search, refined loading/error states.
**Addresses:** Responsive Mobile Layout, Symbol Search, visual polish
**Avoids:** Bundle bloat from yahoo-finance2 in client (verify build output)

### Phase Ordering Rationale

- Phase 1 before everything: The quant engine and API routes are hard dependencies for every UI component. Building UI first would require mock data and then integration rework.
- Phase 2 before Phase 3: Tables are the primary value delivery. Market cards are simpler but less differentiated. A strategist would rather have working Watchlist tables than pretty overview cards.
- Phase 3 before Phase 4: The overview panel needs market data display working before adding AI-generated content on top.
- Phase 4 is deliberately late: AI summaries are the wow factor but the dashboard must be fully functional without them. This also allows quota management to be designed with full understanding of actual usage patterns.
- Phase 5 last: Polish and responsive design benefit from applying to a complete product rather than iterating on a partial one.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Yahoo Finance API behavior (rate limits, response schema, error patterns) -- needs hands-on testing to validate caching strategy
- **Phase 3:** Fear & Greed Index data source -- no standard API exists, may need CNN scraping or alternative provider
- **Phase 4:** Gemini prompt engineering for 3-line summaries -- needs iteration to produce consistently useful output within token constraints

Phases with standard patterns (skip research-phase):
- **Phase 2:** Standard React table component, Zustand store, TanStack Query hooks -- well-documented patterns
- **Phase 5:** Tailwind responsive design, Recharts sparklines -- straightforward implementation with official docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official sources, npm downloads, and version compatibility. Clear deprecation warnings identified (old Gemini SDK). |
| Features | HIGH | Feature landscape well-researched with clear table-stakes vs differentiator distinction. Anti-features explicitly defined, preventing scope creep. |
| Architecture | HIGH | BFF proxy pattern is the canonical approach for yahoo-finance2. TanStack Query + Zustand separation is community consensus. Two-layer caching is documented by Vercel. |
| Pitfalls | HIGH | All critical pitfalls backed by GitHub issues, official docs, or mathematical certainty (float precision). Yahoo API instability is extensively documented by community. |

**Overall confidence:** HIGH

### Gaps to Address

- **Fear & Greed Index data source:** No standard free API identified. CNN's index is scrapeable but fragile. Need to research alternatives or consider a simplified sentiment indicator during Phase 3 planning.
- **EPS Revision data availability:** The Action Signal formula requires "Revision UP/DOWN" for earnings estimate revisions. It is unclear whether yahoo-finance2 exposes this field via quote() or quoteSummary(). Needs hands-on validation in Phase 1.
- **TanStack Query staleTime + refetchInterval interaction (Issue #7721):** Reported bug where actual refetch = staleTime + refetchInterval. May require setting staleTime to 0 or 1 minute instead of 4 minutes. Needs testing with the specific TanStack Query version used.
- **Gemini 2.5 Flash-Lite quality for summaries:** Lower-quota model may produce lower-quality 3-line summaries. Needs A/B comparison during Phase 4 implementation.
- **Korean localization scope:** UI is Korean-only per spec. Need to confirm whether financial terms (RS, Drawdown, etc.) should be in Korean or kept as English technical terms.

## Sources

### Primary (HIGH confidence)
- [yahoo-finance2 npm](https://www.npmjs.com/package/yahoo-finance2) -- server-only constraints, API methods, batch fetching
- [@google/genai npm](https://www.npmjs.com/package/@google/genai) -- new SDK, GA since May 2025
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) -- free tier: 10 RPM / 250 RPD for Flash
- [TanStack Query polling docs](https://tanstack.com/query/latest/docs/framework/react/guides/polling) -- refetchInterval configuration
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- BFF proxy pattern
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching) -- s-maxage and stale-while-revalidate
- [Zustand npm](https://www.npmjs.com/package/zustand) -- v5, useSyncExternalStore
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, production-ready

### Secondary (MEDIUM confidence)
- [Yahoo Finance rate limits - GitHub issues](https://github.com/ranaroussi/yfinance/issues/2128) -- community-reported limits (~360 req/hour)
- [TanStack Query Issue #7721](https://github.com/TanStack/query/issues/7721) -- staleTime + refetchInterval interaction bug
- [Recharts npm](https://www.npmjs.com/package/recharts) -- v3.8.1, SVG-based charts

### Tertiary (LOW confidence)
- Fear & Greed Index data availability -- no official free API confirmed
- EPS Revision field availability in yahoo-finance2 -- needs hands-on validation

---
*Research completed: 2026-04-12*
*Ready for roadmap: yes*
