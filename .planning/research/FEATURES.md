# Feature Landscape

**Domain:** Real-time financial quant dashboard for macro strategist
**Researched:** 2026-04-12

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Market Snapshot Cards (S&P 500, NASDAQ, BTC, GOLD, 10Y Yield, DXY) | Every financial dashboard shows key indices at a glance. A macro strategist without live index cards is using a spreadsheet, not a dashboard. | Low | 6-7 cards with price, daily change %, directional arrow. Yahoo Finance API provides all. 5-min refresh via TanStack Query `refetchInterval`. |
| Fear & Greed Index Display | Sentiment gauge is standard in macro dashboards. CNN Fear & Greed is the de facto benchmark. | Low | Scrape or use alternative API. Display as color-coded gauge (0-100). Color spectrum: red (extreme fear) to green (extreme greed). |
| Watchlist Table with Core Columns | Every stock dashboard has a watchlist table. Columns: Symbol, Price, 1D%, 52W High, Drawdown, RS, MA50 Distance, Revision, FWD P/E. | Medium | 12 symbols. Table must be scannable at a glance. Color-code negative vs positive values. Right-align numeric columns. |
| Monitoring List Table | Separation of active watchlist vs secondary monitoring is standard for strategists tracking 20+ names. | Low | Same column structure as Watchlist. 9 symbols. Reuse identical table component. |
| Table Sorting | Click-to-sort on column headers is universally expected in data tables. Users will try to click headers instinctively. | Low | Ascending/descending toggle on click. Visual arrow indicator on active sort column. Default sort: RS descending. |
| Quant Signal Calculation (RS, MA50 Distance, Drawdown) | These are the core quantitative metrics. Without automated calculation, the dashboard has no quant value -- it is just a price viewer. | Medium | RS = (Ticker Change% / SPX Change%) x 100. MA50 Dist = (Price - MA50) / MA50 x 100. Drawdown = (Price - 52W High) / 52W High x 100. All server-side via Next.js API Routes. |
| Action Signal Generation (Buy/Hold/Wait/Trim) | The core value proposition. Mechanical action signals remove emotional bias from decision-making. Without this, the dashboard is just another data display. | Medium | Conditional logic: Revision UP + RS>110 + MA50 Dist<5% = Buy. RS>130 + MA50 Dist>12% = Trim. Revision DOWN + RS<90 = Wait. Else = Hold. Color-coded chips: green/blue/amber/red. |
| Responsive Mobile Layout | Strategists check markets on phones during commute, meals, meetings. A non-mobile dashboard loses 40%+ of usage occasions. | Medium | Tailwind breakpoints. Cards stack vertically on mobile. Tables scroll horizontally with sticky first column (Symbol). Tab navigation remains accessible. |
| Skeleton UI Loading States | Financial data has inherent latency (API calls, calculations). Blank screens destroy trust. Skeleton loaders signal "data is coming." | Low | Pulse animation placeholders matching card/table shapes. TanStack Query `isLoading` state drives skeleton display. |
| Data Freshness Indicator | Users must know if they are looking at stale data. "Last updated: 2 min ago" is expected in real-time dashboards. | Low | Timestamp displayed near Market Snapshot. Relative time ("2m ago") with absolute time on hover. Visual warning if data is >10 min old. |
| Tab Navigation (Strategic Overview / Watchlist / Monitoring) | Multi-view organization is standard for dashboards with distinct data contexts. Three tabs match the three mental models: macro view, active positions, secondary watch. | Low | Tab bar at top. URL-synced for shareability. Active tab visually distinct. Persist last-active tab in localStorage. |

## Differentiators

Features that set this product apart. Not expected, but provide significant strategic value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI Executive Summary (3-line, Gemini API) | Transforms raw data into actionable narrative. No competing free dashboard auto-generates natural language market summaries. This is the "strategist's brief" -- the first thing read each morning. | Medium | Gemini API call with structured prompt including current macro data (indices, yields, sentiment). 3-line constraint keeps it focused. Cache for 5 min to avoid redundant API calls. Fallback: show "Summary unavailable" gracefully. |
| Macro Threshold Warnings | Proactive alerts when macro indicators cross critical levels (10Y Yield >4.5%, DXY >106, Fear Index <30). Most dashboards show data passively; this one warns you when conditions change strategically. | Low-Medium | Threshold comparison against live data. Visual: amber/red banner or badge on Strategic Overview tab. Configurable thresholds stored in constants (v1) or state (v2). |
| Market Opportunities & Risks Sidebar | Contextual intelligence panel that synthesizes macro conditions into opportunity/risk framing. Moves beyond "what is happening" to "what does it mean." | Medium | Could be AI-generated or rule-based. Sidebar panel on Strategic Overview. 3-5 bullet points each for opportunities and risks. |
| Strategic Timeline (Economic Events) | Calendar of upcoming macro events (FOMC, CPI, earnings) gives forward-looking context. Most free dashboards are backward-looking only. | Medium | Hard-coded or API-sourced economic calendar. Timeline visualization with date, event, expected impact. Highlight events within 7 days. |
| Numerical Checklist (Per-Symbol Action Matrix) | Structured decision support showing which conditions are met per symbol. Makes the Buy/Hold/Wait/Trim logic transparent and auditable. | Medium | Matrix view: rows = symbols, columns = conditions (RS threshold, MA50 threshold, Revision direction). Checkmark/X per condition. Resulting signal in final column. |
| Alpha Watchlist Manual (Indicator Guide) | Persistent reference explaining what each metric means and how to interpret it. Reduces cognitive load and builds confidence in the system's signals. | Low | Static content panel, always visible at top or expandable. Explains RS, MA50 Distance, Drawdown, Action Signal logic in plain language. Collapsible accordion for space efficiency. |
| Symbol Search | Quick-find within watchlist/monitoring tables. Useful when list grows or when checking a specific name quickly. | Low | Client-side filter on symbol/name. Input field above tables. Instant filter as user types. Clear button to reset. |
| Table Filtering (by RS strength, drawdown severity) | Beyond sorting, preset filters like "Show only Buy signals" or "Drawdown > 20%" enable focused analysis. | Low-Medium | Filter chips or dropdown above table. Preset filters: By Signal (Buy/Hold/Wait/Trim), By RS Range, By Drawdown Severity. Combinable filters. |

## Anti-Features

Features to explicitly NOT build. Each would add complexity without matching the project's single-user, opinionated-quant-tool identity.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User Authentication / Login | Single-user personal dashboard. Auth adds complexity, login friction, and session management for zero benefit. | Deploy with Vercel, optionally use Vercel password protection for basic access control if needed. |
| Dynamic Watchlist CRUD (Add/Remove symbols via UI) | Over-engineering for v1. The strategist's universe is stable (12+9 names). UI for add/remove invites scope creep and requires validation, persistence, and error handling. | Hard-code symbol lists in config file. Change via code deploy. Consider for v2 only if validated need. |
| Backend Database / Persistence Layer | All data is real-time from APIs. No historical analysis, no user state to persist. A database adds hosting cost, migration complexity, and operational burden. | Fetch all data fresh from Yahoo Finance API. Use localStorage only for UI preferences (active tab, sort order). |
| Push Notifications / Email Alerts | v1 is a dashboard, not an alerting system. Push notifications require service workers, notification permissions, and email requires SMTP setup. Threshold warnings on-screen are sufficient. | Visual threshold warnings within the dashboard UI. Amber/red banners catch attention during active use. |
| Multi-Language Support | Single user, Korean language preference. i18n infrastructure (message files, locale switching, RTL support) is pure overhead. | Korean-only UI. All text hardcoded in Korean. |
| Candlestick / Interactive Charts | Full charting is a separate product category (TradingView, ThinkorSwim). Building even basic interactive charts is a rabbit hole of complexity (zoom, pan, crosshair, time ranges). The dashboard's value is in signal generation, not chart analysis. | Link to TradingView or Yahoo Finance for deep charting. The dashboard is a decision-support tool, not a charting platform. |
| Portfolio Tracking / P&L | Requires trade entry, position sizing, cost basis tracking, realized/unrealized P&L. This is portfolio management, not market sensing. Completely different product category. | Focus on forward-looking signals (Buy/Hold/Wait/Trim) rather than backward-looking performance tracking. |
| Backtesting Engine | Tempting for a quant tool, but backtesting requires historical data storage, strategy definition UI, and result visualization. Massive scope that distracts from the core monitoring use case. | Validate signal logic offline using spreadsheets or Python. The dashboard applies pre-validated logic, it does not discover it. |
| Real-Time Streaming (WebSocket) | 5-min polling is sufficient for macro strategy. WebSocket adds connection management, reconnection logic, and server infrastructure. Macro decisions do not require sub-second data. | 5-min polling via TanStack Query refetchInterval. Simple, reliable, within free API tier limits. |
| Dark Mode | Nice-to-have cosmetic feature that doubles CSS maintenance and testing surface. The Premium Minimal Brutalism design system is defined with a light palette. | Ship with designed light theme only. Consider dark mode only if the user specifically requests it post-launch. |

## Feature Dependencies

```
Market Snapshot Cards -----> (independent, no dependencies)
                              |
Yahoo Finance API Integration --> Quant Signal Calculation (RS, MA50, Drawdown)
                              |         |
                              |         v
                              |   Action Signal Generation (Buy/Hold/Wait/Trim)
                              |         |
                              |         v
                              |   Numerical Checklist (per-symbol matrix)
                              |
                              +--> Watchlist Table (requires price data + quant signals)
                              |
                              +--> Monitoring List Table (same dependency)
                              |
                              +--> Macro Threshold Warnings (requires index/yield data)
                              |
Gemini API Integration -----> AI Executive Summary
                              |
                              +--> Market Opportunities & Risks Sidebar

Tab Navigation (independent shell) --> Houses all content views

Skeleton UI (independent) --> Applied across all data-loading components

Responsive Layout (independent) --> Applied as CSS layer across all components

Table Sorting (requires tables) --> Applied after Watchlist/Monitoring tables built

Symbol Search (requires tables) --> Applied after Watchlist/Monitoring tables built

Strategic Timeline (semi-independent) --> Requires economic event data source
```

## MVP Recommendation

**Prioritize (Phase 1 -- Core Dashboard):**

1. **Tab Navigation shell** -- structural foundation, build first
2. **Yahoo Finance API integration + Market Snapshot Cards** -- proves data pipeline works
3. **Quant Signal Calculation engine** -- RS, MA50 Distance, Drawdown
4. **Action Signal Generation** -- the core value prop, Buy/Hold/Wait/Trim
5. **Watchlist Table with sorting** -- primary data view with all columns
6. **Monitoring List Table** -- reuses Watchlist component
7. **Skeleton UI loading states** -- polish that builds trust
8. **Responsive mobile layout** -- applied throughout as Tailwind responsive classes

**Prioritize (Phase 2 -- Intelligence Layer):**

1. **Macro Threshold Warnings** -- proactive alerts on Strategic Overview
2. **AI Executive Summary (Gemini)** -- the differentiating "strategist's brief"
3. **Alpha Watchlist Manual** -- static content, low effort, high clarity
4. **Data freshness indicator** -- small but trust-building
5. **Fear & Greed Index** -- completes the macro snapshot

**Defer to Phase 3:**

1. **Market Opportunities & Risks Sidebar** -- depends on AI integration maturity
2. **Strategic Timeline** -- requires economic calendar data source research
3. **Numerical Checklist** -- useful but not critical if Action Signals are clear
4. **Table Filtering** -- sorting handles 80% of the use case for 21 symbols
5. **Symbol Search** -- low urgency with only 21 total symbols

## Sources

- [Phoenix Strategy Group - How to Design Real-Time Financial Dashboards](https://www.phoenixstrategy.group/blog/how-to-design-real-time-financial-dashboards)
- [Intrinio - Building Analytics Dashboards with Real-Time Financial Data](https://intrinio.com/blog/building-analytics-dashboards-with-real-time-financial-data)
- [Eleken - Fintech Design Guide with Patterns that Build Trust 2026](https://www.eleken.co/blog-posts/modern-fintech-design-guide)
- [DesignRush - 9 Dashboard Design Principles 2026](https://www.designrush.com/agency/ui-ux-design/dashboard/trends/dashboard-design-principles)
- [Koyfin - Create Stock Watchlist with Analyst Ratings and Price Alerts](https://www.koyfin.com/blog/get-analyst-ratings-price-alerts-valuation-data-watchlist/)
- [TC2000 - How to Sort a WatchList by a Column](https://help.tc2000.com/m/69401/l/326935-how-to-sort-a-watchlist-by-a-column)
- [IndexBox - How to Set Risk Thresholds with Macro Driver Evidence](https://www.indexbox.io/blog/mi-2026-04-09-forecasting-how-to-communicate-forecast-confidence-and-assumptio-s04/)
- [Oakhill Financial - AI Financial Dashboards and MCP Servers 2026](https://oakhillfinancialservices.com/ai-financial-dashboards-mcp/)
- [NURP - Quant Trading Platform Features for 2026](https://nurp.com/algorithmic-trading-blog/quant-trading-platform-features/)
- [G&Co - Banking App Design Trends 2026](https://www.g-co.agency/insights/banking-app-design-trends-2025-ux-ui-mobile-insights)
