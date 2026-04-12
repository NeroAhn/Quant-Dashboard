---
phase: 01-foundation-data-pipeline
plan: 02
subsystem: api
tags: [yahoo-finance2, quant-engine, action-signals, vitest, tdd, next-api-routes]

# Dependency graph
requires:
  - phase: 01-foundation-data-pipeline/01-01
    provides: TypeScript types (QuantMetrics, WatchlistItem), constants (QUANT_THRESHOLDS, WATCHLIST_TICKERS)
provides:
  - calculateRS, calculateMA50Dist, calculateDrawdown pure quant functions
  - getDecisionAction action signal logic with D-08 OR semantics
  - deriveRevision EPS revision from earningsTrend
  - GET /api/watchlist (12 tickers with quant metrics + signals)
  - GET /api/monitoring (9 tickers with quant metrics + signals)
  - buildTickerResponse shared helper with Promise.allSettled partial failure
affects: [01-foundation-data-pipeline/01-03, 01-foundation-data-pipeline/01-04, 02-ui-components]

# Tech tracking
tech-stack:
  added: [vitest]
  patterns: [TDD for quant functions, yahoo-finance2 v3 instantiation, Promise.allSettled partial failure, epsilon float comparison]

key-files:
  created:
    - src/lib/quant/engine.ts
    - src/lib/quant/engine.test.ts
    - src/lib/quant/signals.ts
    - src/lib/quant/signals.test.ts
    - src/lib/yahoo-finance/client.ts
    - src/lib/yahoo-finance/quotes.ts
    - src/lib/yahoo-finance/types.ts
    - src/app/api/watchlist/route.ts
    - src/app/api/monitoring/route.ts
    - vitest.config.ts
  modified:
    - package.json

key-decisions:
  - "yahoo-finance2 v3 requires instantiation with new YahooFinance() -- static methods are deprecated"
  - "deriveRevision compares 0q vs +1q earningsEstimate.avg with 0.01 threshold for UP/DOWN/NEUTRAL"
  - "Generic error messages in API responses per T-02-02 threat mitigation"

patterns-established:
  - "TDD with vitest: test file co-located as *.test.ts, path alias via vitest.config.ts"
  - "Quant pure functions: zero-dependency calculation with EPSILON division-by-zero guards"
  - "API route pattern: S&P 500 fetch first for RS baseline, then Promise.allSettled for ticker batch"
  - "Shared buildTickerResponse helper: both watchlist and monitoring routes use same logic"

requirements-completed: [DATA-01, DATA-05, QENG-01, QENG-02, QENG-03, QENG-04, ASIG-01, ASIG-02, ASIG-03, ASIG-04]

# Metrics
duration: 6min
completed: 2026-04-12
---

# Phase 01 Plan 02: Quant Engine + Action Signals + API Routes Summary

**TDD-verified quant engine (RS, MA50 Dist, Drawdown) with epsilon float comparison, D-08 OR-logic action signals, and /api/watchlist + /api/monitoring endpoints using yahoo-finance2 v3**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-12T11:38:36Z
- **Completed:** 2026-04-12T11:44:50Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Quant engine with 3 pure calculation functions (RS, MA50 Distance, Drawdown) validated by 8 test cases including division-by-zero guards
- Action signal logic (Buy/Trim/Wait/Hold) with correct priority ordering, D-08 OR logic for Wait, and QENG-04 epsilon boundary comparison -- 8 test cases
- /api/watchlist and /api/monitoring endpoints with server-side quant computation, Promise.allSettled partial failure handling, and EPS Revision derivation from earningsTrend

## Task Commits

Each task was committed atomically:

1. **Task 1: Quant Engine + Action Signals TDD** - `7c1a30d` (feat)
2. **Task 2: Yahoo Finance Wrapper + API Routes** - `72b571e` (feat)

## Files Created/Modified
- `src/lib/quant/engine.ts` - RS, MA50 Dist, Drawdown pure calculation functions with EPSILON guards
- `src/lib/quant/engine.test.ts` - 8 test cases for quant engine edge cases
- `src/lib/quant/signals.ts` - getDecisionAction with Trim>Buy>Wait>Hold priority and D-08 OR logic
- `src/lib/quant/signals.test.ts` - 8 test cases for signal logic including epsilon boundaries
- `src/lib/yahoo-finance/client.ts` - yahoo-finance2 v3 instantiated client with validation suppression
- `src/lib/yahoo-finance/quotes.ts` - deriveRevision, fetchTickerData, buildTickerResponse helpers
- `src/lib/yahoo-finance/types.ts` - YFQuoteResult interface for Yahoo Finance response subset
- `src/app/api/watchlist/route.ts` - GET /api/watchlist for 12 tickers
- `src/app/api/monitoring/route.ts` - GET /api/monitoring for 9 tickers
- `vitest.config.ts` - Test runner configuration with path aliases
- `package.json` - Added test script and vitest dependency

## Decisions Made
- yahoo-finance2 v3 requires `new YahooFinance()` instantiation; static methods like `yahooFinance.quote()` return `never` type. Updated client pattern accordingly.
- deriveRevision uses 0q vs +1q earningsEstimate.avg comparison with 0.01 cent threshold for direction
- quoteSummary earningsTrend call is wrapped in catch to gracefully handle missing data (IONQ, OKLO etc. may lack coverage)
- Generic "Failed to fetch data" error messages per T-02-02 threat mitigation -- Yahoo Finance internals not exposed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] yahoo-finance2 v3 API change -- static methods deprecated**
- **Found during:** Task 2 (Yahoo Finance wrapper implementation)
- **Issue:** Plan referenced `yahooFinance.setGlobalConfig()` and static method calls, but yahoo-finance2 v3 deprecates all static methods (return `never` type). Must use `new YahooFinance(options)` pattern.
- **Fix:** Changed client.ts to instantiate `new YahooFinance({ validation: { logErrors: false } })` instead of calling deprecated `setGlobalConfig`.
- **Files modified:** src/lib/yahoo-finance/client.ts
- **Verification:** `npx tsc --noEmit` exits 0, `npm run build` succeeds
- **Committed in:** 72b571e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for TypeScript compilation. No scope creep.

## Issues Encountered
- yahoo-finance2 warns about Node >= 22.0.0 requirement (running on Node 20.20.2) -- non-blocking warning, library functions correctly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Quant engine and API routes ready for TanStack Query integration (Plan 01-03/01-04)
- /api/watchlist and /api/monitoring serve complete data for Watchlist/Monitoring tab UI (Phase 2)
- earningsTrend response structure should be validated at runtime with real API calls to confirm Revision logic accuracy (Assumption A4 from RESEARCH.md)

## Self-Check: PASSED

All 10 created files verified on disk. Both task commits (7c1a30d, 72b571e) found in git log. SUMMARY.md exists.

---
*Phase: 01-foundation-data-pipeline*
*Completed: 2026-04-12*
