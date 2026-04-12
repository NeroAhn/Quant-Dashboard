# Domain Pitfalls

**Domain:** Real-time financial quant dashboard (Next.js + Yahoo Finance + Gemini API on Vercel)
**Researched:** 2026-04-12

## Critical Pitfalls

Mistakes that cause rewrites, data corruption, or complete service failure.

---

### Pitfall 1: Yahoo Finance API Is Unofficial and Will Break Without Warning

**What goes wrong:** Yahoo Finance has no official public API. All "free" access methods (including the `yahoo-finance2` npm package) scrape unofficial endpoints that Yahoo can change, throttle, or block at any time. In early 2024, Yahoo tightened limits significantly. In 2025, users report 429 errors after ~950 ticker requests, with documented limits of no more than 360 requests/hour. During high-traffic periods (market open, earnings), limits get stricter.

**Why it happens:** Yahoo never committed to a public API contract. The `yahoo-finance2` library reverse-engineers internal endpoints. Yahoo actively fights automated scraping to reduce infrastructure costs.

**Consequences:**
- Dashboard shows no data or stale data with no warning to the user
- Silent failures where old cached data appears current
- Complete outage during the most critical moments (market open, volatility events)
- IP-level bans from Vercel's shared IP pool affecting all serverless functions

**Warning signs:**
- Intermittent 429 responses in API route logs
- Increased response times from Yahoo endpoints (>2s)
- Data fields returning `null` or `undefined` where they previously had values
- Different data structure in responses (Yahoo changed the schema)

**Prevention:**
1. **Batch all ticker requests into minimal API calls.** Fetch all 21 tickers (12 watchlist + 9 monitoring) in a single `yahoo-finance2` `quote()` call, not 21 individual calls
2. **Implement aggressive server-side caching.** Cache responses for the full 5-minute interval. Never re-fetch within the interval even if a new user loads the page
3. **Add a circuit breaker.** After 3 consecutive failures, stop calling Yahoo for 10 minutes and serve cached data with a visible "Data delayed" warning
4. **Log and monitor Yahoo response status codes.** Alert on 429s or schema changes
5. **Design the data layer with provider abstraction.** When Yahoo breaks (not if), you need to swap to Alpha Vantage, Finnhub, or Twelve Data without rewriting the frontend

**Detection:** Monitor API route response codes and latency. Set up error tracking for Yahoo-specific failures.

**Phase impact:** Must be addressed in Phase 1 (data layer). The abstraction layer and caching are foundational.

**Confidence:** HIGH - Multiple GitHub issues, community reports, and direct Yahoo documentation confirm these limits.

---

### Pitfall 2: Gemini API Free Tier Quota Exhaustion

**What goes wrong:** The Gemini API free tier was reduced by 50-80% in December 2025. Current limits for Gemini 2.5 Flash are 10 RPM and 250 RPD (requests per day). If the dashboard generates a 3-line Executive Summary on every page load or every 5-minute refresh, you will exhaust the daily quota within 1-2 hours of active use. Gemini 2.0 Flash was deprecated in February 2026 and retired March 3, 2026.

**Why it happens:** Developers design the refresh logic assuming Gemini calls are cheap/unlimited. A 5-minute refresh cycle = 12 calls/hour = 288 calls/day, exceeding the 250 RPD limit.

**Consequences:**
- Executive Summary section goes blank mid-day with no explanation
- 429 errors from Gemini API cause unhandled promise rejections
- User sees the dashboard as "broken" even though market data is fine

**Warning signs:**
- 429 responses from Gemini API in logs
- Summary content not updating despite market changes
- Quota usage approaching limits (check Google AI Studio dashboard)

**Prevention:**
1. **Generate summaries on a much longer interval.** Market conditions do not change meaningfully every 5 minutes. Generate a new summary every 30-60 minutes maximum
2. **Cache summaries aggressively.** Store the last successful summary and serve it until the next scheduled generation
3. **Use Gemini 2.5 Flash-Lite (15 RPM, 1000 RPD) for summaries.** It is cheaper on quota and sufficient for a 3-line summary
4. **Implement graceful degradation.** If Gemini fails, show "Summary unavailable - last updated [timestamp]" with the previous summary, not an error state
5. **Pre-compute summary inputs.** Send Gemini a structured prompt with pre-calculated metrics (not raw data), reducing token usage and improving output consistency

**Detection:** Track daily Gemini API call count. Alert at 80% of daily quota.

**Phase impact:** Address in Phase 2 (AI integration). Must be designed with quota awareness from the start.

**Confidence:** HIGH - Official Google documentation confirms these limits. December 2025 quota reduction is well-documented.

---

### Pitfall 3: Floating-Point Arithmetic Corrupts Quant Signals

**What goes wrong:** JavaScript uses IEEE 754 double-precision floats. The quant formulas (RS, MA50 Distance, Drawdown) involve division and percentage calculations that accumulate floating-point errors. Example: `(currentPrice - ma50) / ma50 * 100` can produce values like `4.999999999999998` instead of `5.0`. When action signal logic checks `MA50 Dist < 5%`, this value incorrectly passes the threshold, generating a wrong Buy signal.

**Why it happens:** JavaScript has no native decimal type. All numbers are 64-bit floats. Division operations are particularly prone to precision loss. The action signal logic uses exact threshold comparisons (`< 5%`, `> 110`, `> 130`, `< 90`, `> 12%`).

**Consequences:**
- Incorrect Buy/Hold/Wait/Trim signals at threshold boundaries
- User makes trading decisions based on wrong signals
- Inconsistent signals between refreshes for stocks near thresholds (flickering between Buy and Hold)

**Warning signs:**
- Displayed percentages showing excessive decimal places (e.g., `4.999999999998%`)
- Action signals flipping between refreshes without meaningful price changes
- RS values showing as `109.99999` instead of `110`

**Prevention:**
1. **Round all intermediate calculations to 2 decimal places using a consistent rounding function.** Use `Math.round(value * 100) / 100` or a helper like `toFixed(2)` parsed back to number
2. **Add hysteresis to threshold comparisons.** Instead of `RS > 110`, use `RS > 109.5` for activation and `RS < 110.5` for deactivation. This prevents signal flickering at boundaries
3. **Use a single `calculateSignal()` pure function** that takes rounded inputs and produces deterministic outputs. Unit test this function extensively with boundary values
4. **Display values with controlled formatting.** Always `toFixed(1)` or `toFixed(2)` for user-facing numbers
5. **Do NOT use libraries like Decimal.js for this use case** - it is overkill for percentage calculations. Consistent rounding is sufficient.

**Detection:** Unit tests with values at exact thresholds (e.g., RS = 110.0, MA50 Dist = 5.0, RS = 130.0).

**Phase impact:** Must be addressed in Phase 1 when implementing the quant engine. Retrofitting threshold logic is error-prone.

**Confidence:** HIGH - IEEE 754 behavior is well-documented. The specific formulas in PROJECT.md use exact threshold comparisons, making this a guaranteed issue.

---

### Pitfall 4: Stale Data Displayed as Fresh Data

**What goes wrong:** When Yahoo Finance API fails silently (returns cached/delayed data, times out, or returns partial data), the dashboard continues displaying the last successful fetch without indicating staleness. The user sees prices that look real-time but are actually minutes or hours old. This is especially dangerous during volatile market events when the user relies most on the dashboard.

**Why it happens:** TanStack Query's default behavior serves cached data while refetching in the background. If the refetch fails, the stale data remains displayed. Without explicit staleness indicators, users cannot distinguish fresh from stale data.

**Consequences:**
- User makes trading decisions based on outdated prices
- RS calculations are wrong because the ticker and S&P 500 data are from different timestamps
- Action signals are based on stale inputs, potentially suggesting Buy when the price has already moved

**Warning signs:**
- `dataUpdatedAt` timestamp in TanStack Query not advancing
- Price values not changing during active market hours
- Error boundaries not triggering (because cached data exists)

**Prevention:**
1. **Always display a "Last Updated" timestamp prominently** in the dashboard header. Use relative time ("2 min ago") that turns amber at >5 min and red at >15 min
2. **Configure TanStack Query with explicit staleness handling:**
   ```typescript
   {
     staleTime: 4 * 60 * 1000,        // 4 minutes (just under refresh interval)
     refetchInterval: 5 * 60 * 1000,  // 5 minutes
     refetchIntervalInBackground: false, // Don't waste quota when tab is hidden
     retry: 2,                          // Retry twice on failure
     retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
   }
   ```
3. **Track data timestamps from Yahoo, not just fetch time.** Yahoo can return delayed data even on a successful response. Compare `regularMarketTime` from the response to current time
4. **Ensure all data in a single display is from the same fetch.** Never mix data from different fetch cycles (e.g., price from 10:00 and MA50 from 9:55)
5. **Disable refetch when market is closed.** No need to poll Yahoo outside trading hours (9:30 AM - 4:00 PM ET, weekdays). Serves stale data intentionally with a "Market Closed" indicator

**Detection:** Compare `dataUpdatedAt` against wall clock time. Log fetch success/failure rates.

**Phase impact:** Phase 1 (data layer) for the fetching strategy; Phase 2 (UI) for the staleness indicators.

**Confidence:** HIGH - This is a universal real-time dashboard problem, well-documented in TanStack Query discussions.

---

## Moderate Pitfalls

---

### Pitfall 5: CORS Blocking Direct Browser-to-Yahoo Requests

**What goes wrong:** Developers attempt to call Yahoo Finance endpoints directly from the browser (client-side fetch). Yahoo endpoints do not set CORS headers, so browsers block the responses. The `yahoo-finance2` package explicitly states it cannot run in the browser.

**Prevention:**
1. **All Yahoo Finance calls must go through Next.js API routes (server-side).** This is non-negotiable. API routes run on the server where CORS does not apply
2. **Structure the data flow as:** Browser -> Next.js API Route -> Yahoo Finance -> API Route (cache + transform) -> Browser
3. **Do not use `yahoo-finance2` in client components or `use client` files.** Import it only in API routes or Server Components
4. **If using App Router, use Route Handlers (`app/api/*/route.ts`).** These execute server-side

**Phase impact:** Phase 1 architecture decision. Getting this wrong means rewriting the entire data fetching layer.

**Confidence:** HIGH - Confirmed by yahoo-finance2 documentation and Next.js CORS behavior.

---

### Pitfall 6: Vercel Serverless Function Timeout on Batch Data Fetch

**What goes wrong:** Vercel's Hobby plan limits serverless function execution to 10 seconds (Pro plan: 60 seconds). If the API route fetches 21 tickers from Yahoo, processes quant calculations, and calls Gemini API sequentially, it can exceed this timeout, especially during Yahoo's slow response periods.

**Prevention:**
1. **Separate API routes by concern.** `/api/market-data` for Yahoo tickers, `/api/summary` for Gemini. Never combine them in one function
2. **Use parallel fetching with `Promise.all`** for independent data requests within a single route
3. **Set reasonable timeouts on Yahoo fetch calls** (5 seconds max per call, with abort controller)
4. **Pre-calculate quant metrics server-side** within the market data route, not in a separate call
5. **Consider Vercel's Fluid Compute** (enabled by default since April 2025) which reduces cold starts to <1% of requests and allows concurrent execution sharing a single instance

**Warning signs:**
- 504 Gateway Timeout errors in Vercel function logs
- Intermittent "function timed out" errors during peak hours
- First request after inactivity taking >3 seconds (cold start)

**Phase impact:** Phase 1 API route architecture.

**Confidence:** HIGH - Vercel timeout limits are documented. Yahoo response latency is variable.

---

### Pitfall 7: Incorrect RS Calculation Due to Mismatched Time Periods

**What goes wrong:** The RS formula is `(Ticker Change% / S&P 500 Change%) * 100`. If the "change percentage" for the ticker and S&P 500 are from different time periods or different data snapshots, the RS value is meaningless. This commonly happens when S&P 500 data is fetched in a separate call from individual tickers, and one call succeeds while the other fails or returns data from a different timestamp.

**Prevention:**
1. **Fetch S&P 500 (^GSPC) in the same batch call as all tickers.** Include it in the symbol list passed to `yahoo-finance2.quote()`
2. **Use the same field for both numerator and denominator.** Both must use `regularMarketChangePercent` from the same API response
3. **Validate that all returned data has the same `regularMarketTime`.** If timestamps differ by more than 1 minute, flag the data
4. **Handle edge cases:** S&P 500 change of 0% (division by zero), pre-market/after-hours data differences

**Phase impact:** Phase 1 quant engine implementation.

**Confidence:** HIGH - Mathematical certainty that mismatched periods produce wrong RS values.

---

### Pitfall 8: TanStack Query refetchInterval and staleTime Interaction Bug

**What goes wrong:** There is a known issue (TanStack Query #7721) where using both `refetchInterval` and `staleTime` together can cause the actual refetch to occur at `refetchInterval + staleTime` instead of just `refetchInterval`. If you set `staleTime: 4min` and `refetchInterval: 5min`, the actual refetch may not happen until 9 minutes.

**Prevention:**
1. **Set `staleTime` shorter than `refetchInterval`.** Use `staleTime: 0` or `staleTime: 60_000` (1 minute) with a `refetchInterval: 300_000` (5 minutes)
2. **Test actual refetch timing in development.** Log when fetches actually fire, not just when they are scheduled
3. **Use `refetchOnWindowFocus: true` as a safety net** to trigger a refetch when the user returns to the dashboard tab

**Phase impact:** Phase 1 data layer configuration.

**Confidence:** MEDIUM - Based on a GitHub issue report. Behavior may vary by TanStack Query version.

---

## Minor Pitfalls

---

### Pitfall 9: Market Hours Timezone Handling

**What goes wrong:** Dashboard shows "live" status or attempts refreshes when the US market is closed. Korean users (KST = UTC+9) need correct timezone conversion to know US market hours (9:30 AM - 4:00 PM ET = 11:30 PM - 6:00 AM KST next day).

**Prevention:**
1. Use a library-free approach: compare current UTC time against ET market hours (accounting for US daylight saving time)
2. Display market status (Open/Pre-Market/After-Hours/Closed) prominently
3. Disable auto-refresh when market is closed to save API quota

**Phase impact:** Phase 2 (UI polish).

**Confidence:** HIGH - Simple timezone math, but commonly overlooked.

---

### Pitfall 10: Skeleton UI Persisting Indefinitely on API Failure

**What goes wrong:** Skeleton loading states show during initial load, but if the API never responds (Yahoo is down, Vercel cold start + timeout), the skeleton stays forever. The user sees an eternally loading dashboard.

**Prevention:**
1. Set a maximum skeleton display time (10 seconds). After that, show an error state with a retry button
2. Use TanStack Query's `isError` and `error` states to render error UI, not just `isLoading`
3. Implement a fallback: if first load fails, show a "Could not load data" message with the last known data timestamp if available

**Phase impact:** Phase 2 (UI/UX).

**Confidence:** HIGH - Common frontend error handling gap.

---

### Pitfall 11: Excessive Bundle Size from yahoo-finance2 in Client Bundle

**What goes wrong:** If `yahoo-finance2` accidentally gets imported in a client component (even transitively), it bloats the browser bundle with Node.js-specific code and potentially crashes at runtime.

**Prevention:**
1. Keep all `yahoo-finance2` imports strictly in `app/api/` route handlers
2. Use Next.js `serverExternalPackages` config to ensure it is never bundled for the client
3. Verify with `next build` output that client bundles do not include yahoo-finance2

**Phase impact:** Phase 1 (project setup).

**Confidence:** HIGH - Well-documented Next.js bundling behavior.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Data Layer | Yahoo API unreliability (#1) | Provider abstraction + aggressive caching + circuit breaker |
| Phase 1: Data Layer | CORS blocking (#5) | All Yahoo calls through API routes, never client-side |
| Phase 1: Quant Engine | Float precision (#3) | Round all intermediates, hysteresis on thresholds, unit tests |
| Phase 1: Quant Engine | Mismatched RS periods (#7) | Batch fetch including ^GSPC, validate timestamps |
| Phase 1: API Routes | Serverless timeout (#6) | Separate routes by concern, parallel fetch, abort controllers |
| Phase 1: TanStack Query | staleTime interaction (#8) | Set staleTime < refetchInterval, test actual timing |
| Phase 2: AI Summary | Gemini quota exhaustion (#2) | 30-60 min generation interval, use Flash-Lite, graceful degradation |
| Phase 2: UI | Stale data display (#4) | Prominent timestamps, amber/red staleness indicators |
| Phase 2: UI | Skeleton persistence (#10) | Max display time, error states, retry button |
| Phase 2: UI | Market hours (#9) | Timezone-aware market status, disable refresh when closed |
| Phase 1: Setup | Bundle bloat (#11) | Server-only imports, verify build output |

## Sources

- [Yahoo Finance API Rate Limits - GitHub Issue #2128](https://github.com/ranaroussi/yfinance/issues/2128)
- [Yahoo Finance API Rate Limit Error - GitHub Issue #2422](https://github.com/ranaroussi/yfinance/issues/2422)
- [Why yfinance Keeps Getting Blocked - Medium](https://medium.com/@trading.dude/why-yfinance-keeps-getting-blocked-and-what-to-use-instead-92d84bb2cc01)
- [Gemini API Rate Limits - Official Google Docs](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Gemini API Free Tier Rate Limits 2026](https://www.aifreeapi.com/en/posts/gemini-api-free-tier-rate-limits)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [yahoo-finance2 npm Package](https://www.npmjs.com/package/yahoo-finance2)
- [Vercel Cold Start Performance](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)
- [Vercel Fluid Compute](https://vercel.com/docs/fluid-compute)
- [TanStack Query staleTime vs refetchInterval Issue #7721](https://github.com/TanStack/query/issues/7721)
- [TanStack Query Important Defaults](https://tanstack.com/query/v4/docs/framework/react/guides/important-defaults)
- [JavaScript Floating-Point Precision in Financial Calculations](https://dev.to/benjamin_renoux/financial-precision-in-javascript-handle-money-without-losing-a-cent-1chc)
- [Next.js CORS Handling](https://blog.logrocket.com/using-cors-next-js-handle-cross-origin-requests/)
