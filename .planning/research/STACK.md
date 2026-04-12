# Technology Stack

**Project:** Quant Strategist Pro Dashboard (Alpha Engine)
**Researched:** 2026-04-12
**Mode:** Ecosystem research for real-time financial quant dashboard

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | 15.x (latest stable) | Full-stack React framework | Vercel-native deployment, App Router for API routes as Yahoo Finance proxy, stable production track record. Use 15.x over 16.x because 15 is the battle-tested stable line -- 16 introduced Turbopack as default bundler and new caching APIs that are still maturing. For a personal dashboard, stability matters more than bleeding-edge DX. | HIGH |
| React | 19.x | UI library | Ships with Next.js 15. Required for TanStack Query v5 and Zustand v5 which both target React 18+. | HIGH |
| TypeScript | 5.x | Type safety | Non-negotiable for financial data. Quant formulas (RS, MA50 Dist, Drawdown) need type-checked interfaces to prevent silent calculation errors. | HIGH |

### Data Layer

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| yahoo-finance2 | ^3.14.0 | Yahoo Finance data fetching | The only maintained Node.js Yahoo Finance library (43K weekly downloads). Server-side only -- cannot run in browser due to CORS/cookie constraints. Use via Next.js Route Handlers. Provides `quote()`, `quoteSummary()`, and `historical()` methods covering all required data: price, 52-week high, MA50, forward P/E. No API key needed. | HIGH |
| @tanstack/react-query | ^5.97.0 | Server state management, polling | Industry standard for async data. `refetchInterval: 300_000` (5 min) matches project spec for auto-refresh. Built-in stale-while-revalidate gives instant UI on revisit. `refetchIntervalInBackground: true` ensures data stays fresh even when tab is backgrounded. Devtools for debugging data flow. | HIGH |
| @google/genai | ^1.48.0 | Gemini API for AI summaries | The NEW official Google GenAI SDK (GA since May 2025). Do NOT use `@google/generative-ai` -- it is deprecated (EOL August 2025). Use Gemini 2.5 Flash for Executive Summary generation: 10 RPM free tier, 250 daily requests, more than sufficient for 5-min refresh cycle. | HIGH |

### State Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zustand | ^5.0.12 | Client-side state | Lightweight (1.1KB), no Provider wrapper, perfect for tab state, filter/sort preferences, and threshold alert configuration. Uses React 18's native `useSyncExternalStore` in v5. Chose over React Context because: (1) no re-render cascade issues, (2) middleware for persist (save user's sort preferences to localStorage), (3) simpler mental model for cross-component state like active tab and search query. | HIGH |

### Styling & UI

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.2.2 | Utility-first CSS | v4 is production-ready (released Jan 2025). 5x faster full builds, CSS-first config (`@import "tailwindcss"` -- no tailwind.config.js needed). Project's Premium Minimal Brutalism design maps well to Tailwind's utility approach: precise spacing, monospaced number rendering, conditional color classes for up/down/warning states. | HIGH |
| Lucide React | ^1.8.0 | Icon library | PRD-specified. Fork of Feather Icons with 1500+ icons. Tree-shakeable -- only bundles icons you import. Covers all needed icons: TrendingUp, TrendingDown, AlertTriangle, Search, ArrowUpDown, etc. | HIGH |

### Charting

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Recharts | ^3.8.1 | Financial data visualization | Best fit for this project's scope. Sparklines for price trends, bar charts for RS comparison, area charts for drawdown visualization. Built on D3 but with declarative React API. Chose over Tremor because: Tremor is higher-level and opinionated about styling (conflicts with custom Brutalism design), while Recharts gives control over every visual element. Lightweight enough for the dashboard's chart needs without D3's complexity. | MEDIUM |

### Dev Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @tanstack/react-query-devtools | ^5.97.0 | Query debugging | Visual inspector for all queries: cache state, refetch timing, error states. Essential during development when tuning 5-min polling intervals and debugging Yahoo Finance API responses. Dev-only (tree-shaken in production). | HIGH |
| ESLint | ^9.x | Code quality | Next.js ships with eslint-config-next. Add strict TypeScript rules. | HIGH |
| Prettier | ^3.x | Code formatting | Consistent formatting across financial calculation modules. | HIGH |

---

## Architecture-Critical Decisions

### Why yahoo-finance2 MUST be Server-Side Only

yahoo-finance2 uses Node.js HTTP and handles Yahoo's auth cookies internally. It **cannot** run in the browser. The correct pattern:

```
Client (TanStack Query) --> Next.js Route Handler (/api/quotes) --> yahoo-finance2 --> Yahoo Finance
```

This also protects against CORS issues and gives you a single point for rate limiting.

### Why @google/genai, NOT @google/generative-ai

Google deprecated `@google/generative-ai` with EOL August 2025. The replacement `@google/genai` is GA since May 2025 with full Gemini 2.0+ feature support. Any tutorial using the old SDK is outdated.

```typescript
// CORRECT - @google/genai (new SDK)
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
});

// WRONG - @google/generative-ai (deprecated)
// import { GoogleGenerativeAI } from '@google/generative-ai';
```

### Gemini API Free Tier Constraints

| Model | RPM | Daily Requests | Tokens/Min |
|-------|-----|----------------|------------|
| Gemini 2.5 Pro | 5 | 100 | 250K |
| Gemini 2.5 Flash | 10 | 250 | 250K |
| Gemini 2.5 Flash-Lite | 15 | 1,000 | 250K |

**Recommendation:** Use **Gemini 2.5 Flash** for Executive Summary. At 5-min refresh intervals, that is 288 requests/day for continuous operation -- exceeds the 250 daily limit. Mitigation: generate summary on-demand (button click) or cache aggressively (regenerate every 30 min, not every 5 min). If cost is acceptable, paid tier removes daily caps.

### TanStack Query Polling Configuration

```typescript
// Market data: 5-min intervals per spec
useQuery({
  queryKey: ['quotes', symbols],
  queryFn: () => fetchQuotes(symbols),
  refetchInterval: 5 * 60 * 1000, // 300,000ms = 5 minutes
  refetchIntervalInBackground: true,
  staleTime: 4 * 60 * 1000, // Consider data stale after 4 min
  gcTime: 10 * 60 * 1000, // Keep in cache for 10 min
});

// Gemini summary: longer interval or on-demand
useQuery({
  queryKey: ['executive-summary'],
  queryFn: fetchSummary,
  refetchInterval: 30 * 60 * 1000, // 30 minutes
  staleTime: 25 * 60 * 1000,
});
```

### Zustand Store Structure

```typescript
interface DashboardStore {
  // Tab state
  activeTab: 'overview' | 'watchlist' | 'monitoring';
  setActiveTab: (tab: DashboardStore['activeTab']) => void;

  // Search & filters
  searchQuery: string;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';

  // Threshold alerts (configurable)
  thresholds: {
    yield10Y: number;  // default 4.5
    dxy: number;       // default 106.0
    fearIndex: number; // default 30
  };
}
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Next.js 16 | v16 has Turbopack default and new caching APIs still maturing. v15 is battle-tested for production. |
| Data fetching | yahoo-finance2 | Alpha Vantage, Finnhub | Require API keys, have tighter free tier limits. yahoo-finance2 is free with no key required. |
| AI SDK | @google/genai | @google/generative-ai | Deprecated, EOL Aug 2025. Not an option. |
| AI SDK | @google/genai | Vercel AI SDK (@ai-sdk/google) | Over-engineered for this use case (single text generation call). Adds unnecessary abstraction layer. |
| State mgmt | Zustand | Jotai | Jotai is atom-based (bottom-up), Zustand is store-based (top-down). Dashboard has clear global state shape -- Zustand's single-store model fits better. |
| State mgmt | Zustand | React Context | Re-render cascade with frequent financial data updates. Context triggers re-renders for all consumers. |
| Charts | Recharts | Tremor | Tremor's opinionated styling conflicts with custom Brutalism design system. Less control over chart appearance. |
| Charts | Recharts | D3 directly | Overkill for sparklines and simple bar charts. D3's imperative API fights React's declarative model. |
| Icons | Lucide React | Heroicons | PRD specifies Lucide. Both are excellent; Lucide has broader icon set for financial UIs. |
| CSS | Tailwind v4 | Tailwind v3 | v4 is stable, faster, simpler config. No reason to use v3 for new projects. |

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| `@google/generative-ai` | Deprecated. EOL August 2025. Use `@google/genai` instead. |
| `yahoo-finance` (v1) | Abandoned. Last update years ago. Use `yahoo-finance2`. |
| Redux / Redux Toolkit | Massive overkill for a personal dashboard with ~5 pieces of global state. |
| Axios | `fetch` is native in Next.js and has built-in caching integration. Axios adds bundle size for no benefit. |
| Chart.js / react-chartjs-2 | Canvas-based, harder to style consistently with Tailwind. Recharts' SVG output integrates better. |
| SWR | TanStack Query has superior polling support (`refetchInterval` with background option) and better devtools. SWR's polling is more basic. |
| Tailwind UI / DaisyUI | Pre-built component styles conflict with the custom Brutalism design system. Build components from Tailwind utilities directly. |
| Socket.io / WebSockets | Yahoo Finance doesn't offer real-time streaming. 5-min HTTP polling via TanStack Query is the correct pattern here. |

---

## Installation

```bash
# Initialize Next.js project
npx create-next-app@latest quant-dashboard --typescript --tailwind --eslint --app --src-dir

# Core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zustand
npm install yahoo-finance2
npm install @google/genai
npm install recharts
npm install lucide-react

# Dev dependencies
npm install -D prettier eslint-config-prettier
```

### Environment Variables (.env.local)

```bash
GEMINI_API_KEY=your_gemini_api_key_here
# No Yahoo Finance key needed -- yahoo-finance2 works without one
```

---

## Version Pinning Strategy

Pin major versions with caret (`^`) to get patches and minor updates:

```json
{
  "dependencies": {
    "next": "^15.3.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.97.0",
    "@tanstack/react-query-devtools": "^5.97.0",
    "zustand": "^5.0.12",
    "yahoo-finance2": "^3.14.0",
    "@google/genai": "^1.48.0",
    "recharts": "^3.8.1",
    "lucide-react": "^1.8.0",
    "tailwindcss": "^4.2.2"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0"
  }
}
```

---

## Sources

- [yahoo-finance2 npm](https://www.npmjs.com/package/yahoo-finance2) - v3.14.0, 43K weekly downloads
- [yahoo-finance2 GitHub](https://github.com/gadicc/yahoo-finance2) - Server-side only constraint documented
- [@google/genai npm](https://www.npmjs.com/package/@google/genai) - v1.48.0, GA since May 2025
- [@google/generative-ai deprecation](https://github.com/google-gemini/deprecated-generative-ai-js) - EOL August 2025
- [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) - Free tier: 10 RPM / 250 daily for Flash
- [@tanstack/react-query npm](https://www.npmjs.com/package/@tanstack/react-query) - v5.97.0
- [TanStack Query polling docs](https://tanstack.com/query/latest/docs/framework/react/guides/polling)
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.12
- [Zustand v5 announcement](https://pmnd.rs/blog/announcing-zustand-v5/)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) - v4.2.2
- [Next.js npm](https://www.npmjs.com/package/next) - v15.x stable line recommended
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Recharts npm](https://www.npmjs.com/package/recharts) - v3.8.1
- [Lucide React npm](https://www.npmjs.com/package/lucide-react) - v1.8.0
