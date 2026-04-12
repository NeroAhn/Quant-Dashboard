---
phase: 02-dashboard-ui
reviewed: 2026-04-12T12:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - src/app/globals.css
  - src/app/page.tsx
  - src/components/layout/Header.tsx
  - src/components/layout/MetricGuide.tsx
  - src/components/layout/TabNavigation.tsx
  - src/components/overview/MarketCards.tsx
  - src/components/overview/NumericalChecklist.tsx
  - src/components/overview/SidePanel.tsx
  - src/components/overview/StrategicOverview.tsx
  - src/components/overview/StrategicTimeline.tsx
  - src/components/overview/ThresholdWarnings.tsx
  - src/components/tables/MonitoringTab.tsx
  - src/components/tables/StockTable.tsx
  - src/components/tables/WatchlistTab.tsx
  - src/components/ui/ActionBadge.tsx
  - src/components/ui/RevisionBadge.tsx
  - src/components/ui/SearchBar.tsx
  - src/components/ui/SortHeader.tsx
  - src/lib/colors.ts
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-12T12:00:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

The Phase 02 dashboard UI layer is well-structured with clean component decomposition, proper TypeScript typing, and consistent use of the project's design system. The code correctly leverages Zustand for state management and TanStack Query hooks for data fetching. No security vulnerabilities were found. The main concerns are: (1) a potential runtime crash when sorting on nullable numeric fields, (2) hardcoded content that should come from data or configuration, and (3) a shared search/sort state that leaks across tabs.

## Warnings

### WR-01: Sorting on nullable numeric fields can produce NaN comparisons

**File:** `src/components/tables/StockTable.tsx:60-63`
**Issue:** The sort comparator casts `a[field]` to `number` for fields like `rs`, `drawdown`, and `ma50Dist`. While `QuantMetrics` defines these as non-nullable `number`, the `WatchlistItem` also contains nullable fields (`change1D`, `forwardPE`, `price`). If `SortField` is ever extended to include these nullable fields, the sort will produce `NaN` results, causing unstable ordering. More immediately, the `as number` cast bypasses TypeScript's safety -- if the upstream API ever returns an unexpected shape (e.g., `null` due to a partial failure that passes the `isFullItem` guard), sorting will silently break.
**Fix:** Add null-safety to the numeric sort comparator:
```typescript
const aVal = (a[field] as number | null) ?? 0;
const bVal = (b[field] as number | null) ?? 0;
return (aVal - bVal) * mul;
```

### WR-02: Search and sort state is shared across Watchlist and Monitoring tabs

**File:** `src/store/dashboard.ts:13` and `src/components/tables/StockTable.tsx:43`
**Issue:** Both `WatchlistTab` and `MonitoringTab` render `StockTable`, which reads `searchQuery` and `sortConfig` from a single global Zustand store. When a user types a search in the Watchlist tab, switches to the Monitoring tab, the same search filter applies there -- potentially showing zero results with no user context for why. This is a UX bug that could confuse users into thinking data is missing.
**Fix:** Either scope search/sort state per tab in the store, or reset `searchQuery` when `activeTab` changes:
```typescript
setActiveTab: (tab) => set({ activeTab: tab, searchQuery: "" }),
```

### WR-03: Missing error state handling in MarketCards

**File:** `src/components/overview/MarketCards.tsx:54-89`
**Issue:** The component handles the `isPending` loading state but does not handle the `error` state from `useMarketData()`. If the market data API call fails, the component renders nothing (no cards, no error message), which silently hides a failure from the user. By contrast, `StockTable` properly renders an error message.
**Fix:** Add error handling after the loading check:
```typescript
if (marketData.isPending) return <MarketCardSkeleton />;
if (marketData.error) return (
  <div className="p-4 text-red-500 text-sm">
    Market data unavailable: {marketData.error.message}
  </div>
);
```

### WR-04: Missing error state handling in ThresholdWarnings

**File:** `src/components/overview/ThresholdWarnings.tsx:52-107`
**Issue:** Similar to WR-03, `ThresholdWarnings` consumes `useMarketData()` but only uses `marketData.data` without checking for error state. If the API fails, `marketData.data` is `undefined`, and `getThresholdStatuses` returns all `null` current values with `breached: false` -- rendering a "no warnings" UI that is misleading when the real situation is unknown.
**Fix:** Add a guard for error state, or at minimum show a "data unavailable" indicator when `marketData.data` is undefined and not pending.

## Info

### IN-01: Hardcoded content in SidePanel and StrategicTimeline

**File:** `src/components/overview/SidePanel.tsx:4-12` and `src/components/overview/StrategicTimeline.tsx:4-8`
**Issue:** Market opportunities, risks, and strategic timeline events are hardcoded as static arrays. The timeline contains specific dates ("Apr 14", "Apr 23", "May 01") that will become stale. This is noted as a static placeholder in the codebase (D-03 comment in StrategicOverview), but worth tracking as technical debt.
**Fix:** Extract to a configuration file or make these data-driven when the AI summary feature is implemented.

### IN-02: Duplicate `isFullItem` type guard

**File:** `src/components/overview/NumericalChecklist.tsx:9-13` and `src/components/tables/StockTable.tsx:18-22`
**Issue:** The `isFullItem` type guard function is identically defined in two files. This is minor code duplication that could diverge over time.
**Fix:** Extract to a shared utility, e.g., `src/lib/type-guards.ts`:
```typescript
export function isFullItem(
  item: { symbol: string; error?: string } | WatchlistItem
): item is WatchlistItem {
  return "price" in item;
}
```

### IN-03: Executive Summary is a static placeholder

**File:** `src/components/overview/StrategicOverview.tsx:16-24`
**Issue:** The 3-Line Executive Summary contains hardcoded Korean text. A comment references "D-03" indicating this is intentional for this phase. No action needed now, but this should be replaced with Gemini API-generated content per the project spec.
**Fix:** Track as planned work for the AI integration phase.

---

_Reviewed: 2026-04-12T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
