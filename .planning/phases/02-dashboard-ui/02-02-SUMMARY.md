---
phase: 02-dashboard-ui
plan: 02
subsystem: table-components
tags: [ui, table, sort, search, responsive, badges]
dependency_graph:
  requires: [src/lib/colors.ts, src/store/dashboard.ts, src/types/dashboard.ts, src/hooks/use-watchlist.ts, src/hooks/use-monitoring.ts, src/components/skeleton.tsx]
  provides: [StockTable, WatchlistTab, MonitoringTab, ActionBadge, RevisionBadge, SearchBar, SortHeader]
  affects: [src/app/page.tsx]
tech_stack:
  added: []
  patterns: [zustand-driven-sort-search, shared-table-component, responsive-card-view]
key_files:
  created:
    - src/components/ui/ActionBadge.tsx
    - src/components/ui/RevisionBadge.tsx
    - src/components/ui/SearchBar.tsx
    - src/components/ui/SortHeader.tsx
    - src/components/tables/StockTable.tsx
    - src/components/tables/WatchlistTab.tsx
    - src/components/tables/MonitoringTab.tsx
  modified: []
decisions:
  - Imported color utilities from src/lib/colors.ts (Plan 01 completed first)
  - Used text-brand-accent-blue for WatchlistTab icon leveraging Plan 01 globals.css theme
metrics:
  duration: 109s
  completed: "2026-04-12T12:59:40Z"
  tasks: 2
  files: 7
---

# Phase 02 Plan 02: StockTable Component System Summary

Shared StockTable with 9-column layout, Zustand-driven sort/search, responsive mobile card view, plus ActionBadge/RevisionBadge/SearchBar/SortHeader UI primitives.

## What Was Built

### Task 1: UI Primitive Components (bdc7785)

Created 4 reusable UI primitives in `src/components/ui/`:

- **ActionBadge** -- Renders Buy/Trim/Wait/Hold as color-coded badges using ACTION_COLORS from `@/lib/colors`
- **RevisionBadge** -- Renders UP/DOWN/NEUTRAL as colored pill badges using REVISION_COLORS
- **SearchBar** -- Search input wired to Zustand `searchQuery`/`setSearchQuery` with Korean placeholder
- **SortHeader** -- Clickable `<th>` element with ArrowUp/ArrowDown/ArrowUpDown icons, wired to Zustand `sortConfig`/`setSortConfig`

### Task 2: StockTable + Tab Wrappers (d45b556)

Created shared table system in `src/components/tables/`:

- **StockTable** -- Core shared component with:
  - 9 columns: Symbol, Price/1D%, High/Drawdown, RS, MA50 Dist, Revision, FWD P/E, Strategic Note, Action
  - `isFullItem` type guard filtering out partial error items
  - Search filtering via Zustand `searchQuery` (case-insensitive symbol match)
  - Sort by 4 fields (symbol, rs, ma50Dist, drawdown) with direction toggle via Zustand `sortConfig`
  - Desktop table view (`hidden md:block`) with sortable column headers
  - Mobile card view (`md:hidden`) with Symbol+Action header and 2x2 metric grid
  - RS color coding: >110 green, <90 red (TAB2-06)
  - Empty state message in Korean when search yields no results
- **WatchlistTab** -- Wrapper passing `useWatchlist()` data, 12 default rows, Activity icon
- **MonitoringTab** -- Wrapper passing `useMonitoring()` data, 9 default rows, Layers icon

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

| File | Line | Stub | Reason |
|------|------|------|--------|
| src/components/tables/StockTable.tsx | Strategic Note column | Renders "-" placeholder | D-09 specifies Strategic Note column exists with placeholder; real notes will come from a future plan |

## Self-Check: PASSED

All 7 files found. Both commits (bdc7785, d45b556) verified in git log.
