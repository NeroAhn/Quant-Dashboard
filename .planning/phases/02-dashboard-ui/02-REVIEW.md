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
  info: 4
  total: 8
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-12T12:00:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

The Phase 02 dashboard UI layer is well-structured with clean component decomposition, proper TypeScript typing, and consistent use of the project's design system. The code correctly leverages Zustand for state management and TanStack Query hooks for data fetching. No security vulnerabilities were found. The main concerns are: (1) a potential runtime sort instability when sorting on nullable numeric fields, (2) shared search/sort state that leaks across tabs causing a UX bug, (3) two components that silently swallow API errors with no user feedback, and (4) minor code duplication and hardcoded placeholder content.

## Warnings

### WR-01: Sorting on nullable numeric fields can produce NaN comparisons

**File:** `src/components/tables/StockTable.tsx:60-63`
**Issue:** The sort comparator casts `a[field]` to `number` for fields like `rs`, `drawdown`, and `ma50Dist`. While `QuantMetrics` defines these as non-nullable `number`, the `as number` cast bypasses TypeScript's safety. If the upstream API ever returns an unexpected shape that passes the `isFullItem` guard with an unexpected `null` on one of these fields (possible given Yahoo Finance partial-failure patterns), sorting will produce `NaN`, yielding unstable ordering with no error surfaced.
**Fix:**
```typescript
const aVal = (a[field] as number | null) ?? 0;
const bVal = (b[field] as number | null) ?? 0;
return (aVal - bVal) * mul;
```

### WR-02: Search and sort state is shared across Watchlist and Monitoring tabs

**File:** `src/components/tables/StockTable.tsx:43` (reads shared Zustand store)
**Issue:** Both `WatchlistTab` and `MonitoringTab` render `StockTable`, which reads `searchQuery` and `sortConfig` from a single global Zustand store. When a user types a search in the Watchlist tab and switches to the Monitoring tab, the same filter applies -- potentially showing zero results with no indication of why. Users may misinterpret an empty table as missing data rather than an active filter.
**Fix:** Reset `searchQuery` when `activeTab` changes. In the Zustand store's `setActiveTab` action:
```typescript
setActiveTab: (tab) => set({ activeTab: tab, searchQuery: "" }),
```

### WR-03: Missing error state handling in MarketCards

**File:** `src/components/overview/MarketCards.tsx:57`
**Issue:** The component handles `isPending` but not `error`. If the market data API call fails, the component renders nothing -- no cards, no error message. This silently hides a data failure from the user. By contrast, `StockTable` at line 88 properly renders an error message.
**Fix:**
```typescript
if (marketData.isPending) return <MarketCardSkeleton />;
if (marketData.error) return (
  <div className="p-4 text-sm text-red-500">
    Market data unavailable: {marketData.error.message}
  </div>
);
```

### WR-04: Missing error state handling in ThresholdWarnings

**File:** `src/components/overview/ThresholdWarnings.tsx:52-54`
**Issue:** `ThresholdWarnings` consumes `useMarketData()` but only uses `marketData.data` with no error guard. If the API fails, `marketData.data` is `undefined`, and `getThresholdStatuses` returns all `null` current values with `breached: false`. This renders a misleading "no warnings" state when the actual status is unknown. No loading guard is present either -- the component always renders even during the initial fetch.
**Fix:** Add guards for both pending and error states:
```typescript
if (marketData.isPending) return null; // or a skeleton
if (marketData.error) return (
  <div className="p-4 text-sm text-amber-700 bg-amber-50 rounded-xl border border-amber-100">
    Threshold data unavailable.
  </div>
);
```

## Info

### IN-01: Hardcoded content in SidePanel and StrategicTimeline

**File:** `src/components/overview/SidePanel.tsx:4-12` and `src/components/overview/StrategicTimeline.tsx:4-8`
**Issue:** Market opportunities, risks, and strategic timeline events are hardcoded as static arrays. The timeline contains specific dates ("Apr 14", "Apr 23", "May 01") that are already stale relative to today (2026-04-12). This is noted as a static placeholder (D-03 comment in `StrategicOverview`), but the stale dates are visible to users.
**Fix:** Extract to a configuration file or make data-driven. As an immediate fix, update the dates or add a visible "placeholder" label. Track as planned work for the AI integration phase.

### IN-02: Duplicate `isFullItem` type guard

**File:** `src/components/overview/NumericalChecklist.tsx:9-13` and `src/components/tables/StockTable.tsx:18-22`
**Issue:** The `isFullItem` type guard function is identically defined in two files. This is code duplication that could diverge if the `WatchlistItem` shape changes.
**Fix:** Extract to a shared utility, e.g., `src/lib/type-guards.ts`:
```typescript
import type { WatchlistItem } from "@/types/dashboard";

export function isFullItem(
  item: { symbol: string; error?: string } | WatchlistItem
): item is WatchlistItem {
  return "price" in item;
}
```

### IN-03: Executive Summary is a static placeholder

**File:** `src/components/overview/StrategicOverview.tsx:21-23`
**Issue:** The 3-Line Executive Summary contains hardcoded Korean text referencing specific market conditions. The D-03 comment marks this as intentional for this phase. No action needed now, but this should be replaced with Gemini API-generated content per the project spec.
**Fix:** Track as planned work for the AI integration phase.

### IN-04: Conflicting font-family declarations between CSS and Tailwind utility

**File:** `src/app/globals.css:22` and `src/app/page.tsx:21`
**Issue:** `globals.css` sets `body { font-family: Arial, Helvetica, sans-serif; }` via a plain CSS rule. `page.tsx` applies `font-sans` (Tailwind utility resolving to `--font-geist-sans`) on the root `<div>`. The Tailwind class wins on the div due to specificity, so Geist Sans renders for all content inside it. However, the `body` rule is effectively dead for anything inside the layout div, creating a misleading CSS declaration.
**Fix:** Remove the `font-family` line from `globals.css` body rule, since font configuration is handled via the `@theme` block and Tailwind utility on the root element:
```css
body {
  background: var(--background);
  color: var(--foreground);
  /* font-family removed -- set via font-sans utility in page.tsx */
}
```

---

_Reviewed: 2026-04-12T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
