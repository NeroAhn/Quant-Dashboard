# Phase 3: AI Intelligence & Deployment - Research

**Researched:** 2026-04-12
**Domain:** Gemini AI integration (text generation), Next.js production deployment (Vercel)
**Confidence:** HIGH

## Summary

Phase 3 has two distinct workstreams: (1) replacing the static Executive Summary placeholder in `StrategicOverview.tsx` with Gemini-powered dynamic summaries, and (2) deploying the complete dashboard to Vercel. The `@google/genai` SDK (v1.49.0) provides a straightforward `generateContent` API with `config.systemInstruction` for prompt engineering. The existing codebase has well-established patterns for API routes and TanStack Query hooks that the executive summary feature should follow exactly.

The server-side caching strategy (30-minute in-memory cache) is critical for staying within Gemini's free tier (250 daily requests). The API route must aggregate data from the existing watchlist, monitoring, and market-data endpoints server-side, construct a structured prompt, call Gemini, and cache the result. The TanStack Query hook on the client side polls at 30-minute intervals.

Vercel deployment is straightforward for Next.js 15 projects. The only environment variable needed is `GEMINI_API_KEY`. The project already uses `next build --turbopack` which Vercel supports natively.

**Primary recommendation:** Build a single `/api/executive-summary` route that internally calls existing data-fetching logic (not HTTP self-calls), passes aggregated data to Gemini 2.5 Flash with a Korean-language system instruction, and caches responses in a module-level Map with 30-minute TTL.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Gemini receives ALL data -- Market data (S&P 500, NASDAQ, BTC, Gold, 10Y Yield, DXY, Fear & Greed) + Watchlist/Monitoring stock metrics (RS, MA50 Dist, Drawdown, Action Signal) + Macro Threshold breach status
- **D-02:** 3-line fixed structure -- `1. [Macro]` / `2. [Quant]` / `3. [Market Implication]` enforced in prompt
- **D-03:** Server-side in-memory caching, 30-minute TTL. Protects free tier (250 daily limit)
- **D-04:** On API failure, retain last successful summary with "cached data" indicator
- **D-05:** Summary generated in Korean. Financial terms (RS, Drawdown, MA50) kept in English
- **D-06:** Strategist briefing tone -- concise, assertive, actionable
- **D-07:** Vercel default domain (*.vercel.app), no custom domain
- **D-08:** Basic Vercel config only. GEMINI_API_KEY env var. No Edge Runtime, no ISR optimization

### Claude's Discretion
- Gemini prompt wording details and token length limits
- Server-side cache implementation (Map vs variable)
- TanStack Query refetchInterval for executive summary (within 30 min)
- Vercel build command and output directory settings

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAB1-01 | 3-Line Executive Summary via Gemini API (30-min cache) | @google/genai SDK API patterns, server-side caching strategy, prompt engineering approach, TanStack Query polling hook |
| DEPL-01 | Deploy to Vercel | Vercel Git integration for Next.js 15, environment variable configuration |
| DEPL-02 | API key (Gemini) managed via environment variables | .env.local for local dev, Vercel dashboard for production |
| DEPL-03 | Production build completes without errors | `next build --turbopack` verification, TypeScript strict mode compliance |
</phase_requirements>

## Standard Stack

### Core (new for Phase 3)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/genai | ^1.49.0 | Gemini API client | Official Google GenAI SDK (GA since May 2025). NOT @google/generative-ai (deprecated, EOL Aug 2025). Provides `ai.models.generateContent()` with `config.systemInstruction` support. [VERIFIED: npm registry v1.49.0] |

### Already Installed (Phase 1-2)
| Library | Version | Purpose | Used For |
|---------|---------|---------|----------|
| @tanstack/react-query | ^5.99.0 | Data fetching | `useExecutiveSummary` hook with 30-min refetchInterval |
| next | 15.5.15 | Framework | API Route Handler for `/api/executive-summary` |
| zustand | ^5.0.12 | State | Not needed for this phase |

**Installation:**
```bash
npm install @google/genai
```

## Architecture Patterns

### New Files for Phase 3
```
src/
  app/
    api/
      executive-summary/
        route.ts          # Gemini API route + server-side cache
  lib/
    gemini/
      client.ts           # GoogleGenAI singleton initialization
      prompt.ts           # Prompt builder (aggregates data into structured prompt)
      cache.ts            # In-memory cache with 30-min TTL
  hooks/
    use-executive-summary.ts  # TanStack Query hook (30-min polling)
  components/
    overview/
      ExecutiveSummary.tsx     # Dynamic component replacing static placeholder
```

### Pattern 1: API Route with Server-Side Data Aggregation
**What:** The `/api/executive-summary` route calls existing data-fetching functions server-side (not HTTP self-calls) to gather watchlist, monitoring, and market data, then passes the aggregated payload to Gemini.
**When to use:** When one API route needs data from multiple sources that are already implemented as server-side functions.
**Example:**
```typescript
// Source: Existing pattern from src/app/api/watchlist/route.ts + @google/genai docs
// src/app/api/executive-summary/route.ts
import { NextResponse } from "next/server";
import { getOrRefreshSummary } from "@/lib/gemini/cache";

export async function GET() {
  try {
    const result = await getOrRefreshSummary();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/executive-summary] failure:", error);
    return NextResponse.json(
      { error: "Failed to generate executive summary" },
      { status: 500 }
    );
  }
}
```

### Pattern 2: Gemini Client Singleton
**What:** Initialize `GoogleGenAI` once at module level, reuse across requests.
**Example:**
```typescript
// Source: https://ai.google.dev/gemini-api/docs/text-generation?lang=node [CITED]
// src/lib/gemini/client.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY not set -- executive summary disabled");
}

export const genai = apiKey ? new GoogleGenAI({ apiKey }) : null;
```

### Pattern 3: In-Memory Cache with TTL and Fallback
**What:** Module-level cache stores last successful Gemini response. Cache miss triggers new generation. API failure returns stale cache (D-04).
**Example:**
```typescript
// src/lib/gemini/cache.ts
interface CachedSummary {
  lines: string[];
  generatedAt: string;
  cached: boolean;
}

let cache: { data: CachedSummary; expiry: number } | null = null;
const TTL = 30 * 60 * 1000; // 30 minutes

export async function getOrRefreshSummary(): Promise<CachedSummary> {
  const now = Date.now();
  if (cache && now < cache.expiry) {
    return { ...cache.data, cached: true };
  }
  try {
    const fresh = await generateSummary();
    cache = { data: fresh, expiry: now + TTL };
    return { ...fresh, cached: false };
  } catch (error) {
    // D-04: Return last successful summary on failure
    if (cache) {
      return { ...cache.data, cached: true };
    }
    throw error; // No cache available at all
  }
}
```

### Pattern 4: Gemini generateContent Call
**What:** Call Gemini 2.5 Flash with systemInstruction for tone/format control and user content containing aggregated financial data.
**Example:**
```typescript
// Source: https://ai.google.dev/gemini-api/docs/text-generation?lang=node [CITED]
import { genai } from "./client";

async function generateSummary(): Promise<CachedSummary> {
  if (!genai) throw new Error("Gemini API not configured");

  const aggregatedData = await fetchAllData(); // internal server-side calls

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: buildUserPrompt(aggregatedData),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.3, // Low for consistent, factual output
      maxOutputTokens: 500, // 3 lines should be well under this
    },
  });

  const text = response.text ?? "";
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return {
    lines,
    generatedAt: new Date().toISOString(),
    cached: false,
  };
}
```

### Pattern 5: TanStack Query Hook (30-min Polling)
**What:** Follow established project pattern from `use-market-data.ts` but with 30-minute interval.
**Example:**
```typescript
// src/hooks/use-executive-summary.ts
// Follows exact pattern from src/hooks/use-market-data.ts [VERIFIED: codebase]
import { useQuery } from "@tanstack/react-query";

interface ExecutiveSummaryResponse {
  lines: string[];
  generatedAt: string;
  cached: boolean;
}

export function useExecutiveSummary() {
  return useQuery<ExecutiveSummaryResponse>({
    queryKey: ["executive-summary"],
    queryFn: async () => {
      const res = await fetch("/api/executive-summary");
      if (!res.ok) throw new Error(`Executive summary fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 30 * 60 * 1000, // 30 minutes per D-03
    refetchIntervalInBackground: true,
    staleTime: 25 * 60 * 1000, // Consider stale at 25 min to trigger background refresh
  });
}
```

### Anti-Patterns to Avoid
- **HTTP self-calls in API route:** Do NOT `fetch("/api/watchlist")` from `/api/executive-summary` -- this creates unnecessary HTTP round-trips and can cause issues in serverless environments. Import and call the data-fetching functions directly. [ASSUMED]
- **Client-side Gemini calls:** The SDK works server-side only for API key security. Never expose `GEMINI_API_KEY` to the browser.
- **Using `@google/generative-ai`:** Deprecated, EOL August 2025. Use `@google/genai` only. [CITED: CLAUDE.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI text generation | Custom HTTP calls to Gemini REST API | `@google/genai` SDK | Handles auth, retries, error types, streaming. SDK is 1 line for generateContent |
| Server-side caching | Complex cache invalidation system | Simple module-level Map/variable with TTL | Vercel serverless functions may cold-start; module-level cache persists within warm instances. Good enough for 30-min TTL |
| Prompt formatting | String concatenation | Template literal with structured sections | Readable, maintainable, easy to iterate on prompt structure |

**Key insight:** The Gemini integration is deliberately simple -- a single `generateContent` call. The complexity is in data aggregation and prompt engineering, not SDK usage.

## Common Pitfalls

### Pitfall 1: Serverless Cold Starts Clear In-Memory Cache
**What goes wrong:** Vercel serverless functions cold-start after inactivity, clearing module-level cache. Every cold start triggers a new Gemini API call.
**Why it happens:** Serverless functions are ephemeral. Module-level variables only persist during warm instances.
**How to avoid:** Accept this behavior -- it's fine for a personal dashboard. 30-min cache TTL means worst case is a few extra daily calls, well within 250/day limit. With typical usage patterns (active during market hours), warm instances will cover most requests.
**Warning signs:** Unexpectedly high Gemini API usage in Google AI Studio dashboard.

### Pitfall 2: Gemini Returns Inconsistent Format
**What goes wrong:** Despite prompt instructions, Gemini may occasionally return text that doesn't match the `1. [Macro] / 2. [Quant] / 3. [Market Implication]` structure.
**Why it happens:** LLMs are probabilistic. Even with strict prompts, output format can vary.
**How to avoid:** Parse the response and validate the 3-line structure. If malformed, either retry once or fall back to cached response. Include few-shot examples in the prompt (use current placeholder text as the example).
**Warning signs:** UI showing garbled or incomplete summary.

### Pitfall 3: Missing GEMINI_API_KEY in Production
**What goes wrong:** Build succeeds but executive summary never loads. No error visible to user.
**Why it happens:** Environment variable not set in Vercel dashboard. `process.env.GEMINI_API_KEY` is `undefined` at runtime.
**How to avoid:** Graceful handling when `genai` is null -- show a fallback message like "AI Summary unavailable" instead of a blank section. Log a warning server-side.
**Warning signs:** Executive summary section always shows fallback/loading state in production.

### Pitfall 4: Data Aggregation Server-Side Circular Imports
**What goes wrong:** Importing data-fetching logic from existing API routes can create circular dependency issues or import server-only code in unexpected places.
**Why it happens:** API route files in Next.js App Router have special bundling behavior.
**How to avoid:** Extract data-fetching logic into shared `src/lib/` modules that both the existing API routes and the new executive-summary route can import. If existing routes already use shared lib functions (e.g., `buildTickerResponse`, `fetchFearGreedIndex`), reuse those directly. [VERIFIED: codebase uses `@/lib/yahoo-finance/quotes` and `@/lib/fear-greed/client`]
**Warning signs:** Build errors about server/client module boundaries.

### Pitfall 5: Turbopack Build Issues with New Dependencies
**What goes wrong:** `next build --turbopack` may have edge cases with certain package imports.
**Why it happens:** Turbopack is relatively new as the default bundler flag.
**How to avoid:** Run `npm run build` locally before deploying. If turbopack build fails, falling back to webpack build (`next build` without `--turbopack`) is an option. [ASSUMED]
**Warning signs:** Build fails in Vercel but works in dev mode.

## Code Examples

### Prompt Builder (Core Implementation)
```typescript
// Source: D-01, D-02, D-05, D-06 from CONTEXT.md
// src/lib/gemini/prompt.ts

const SYSTEM_INSTRUCTION = `당신은 18년 경력의 시니어 매크로 전략가입니다.
주어진 시장 데이터를 분석하여 정확히 3줄의 Executive Summary를 작성합니다.

규칙:
- 반드시 아래 형식을 따릅니다:
  1. [Macro] (매크로 환경 분석)
  2. [Quant] (퀀트 시그널 해석)
  3. [Market Implication] (시장 함의 및 액션)
- 한국어로 작성합니다
- 금융 전문 용어(RS, Drawdown, MA50, P/E 등)는 영어 그대로 사용합니다
- 간결하고 단정적인 전문가 어조로 작성합니다
- 각 줄은 1-2문장으로 제한합니다
- actionable 인사이트를 포함합니다`;

export function buildUserPrompt(data: AggregatedData): string {
  return `현재 시장 데이터:

## Market Snapshot
${data.market.map(m => `- ${m.name}: ${m.price} (${m.changePercent?.toFixed(2)}%)`).join("\n")}
- Fear & Greed: ${data.fearGreed?.display ?? "N/A"}

## Macro Threshold Status
- 10Y Yield ${data.thresholdBreaches.yield ? "돌파" : "정상"} (기준: 4.5%)
- DXY ${data.thresholdBreaches.dxy ? "돌파" : "정상"} (기준: 106.0)
- Fear Index ${data.thresholdBreaches.fear ? "경고" : "정상"} (기준: 30 이하)

## Watchlist Top Signals (12 stocks)
${data.watchlist.map(s => `- ${s.symbol}: RS=${s.rs.toFixed(1)}, MA50 Dist=${s.ma50Dist.toFixed(1)}%, DD=${s.drawdown.toFixed(1)}%, Action=${s.action}`).join("\n")}

## Monitoring Top Signals (9 stocks)
${data.monitoring.map(s => `- ${s.symbol}: RS=${s.rs.toFixed(1)}, MA50 Dist=${s.ma50Dist.toFixed(1)}%, DD=${s.drawdown.toFixed(1)}%, Action=${s.action}`).join("\n")}

위 데이터를 기반으로 3-Line Executive Summary를 작성해주세요.`;
}
```

### ExecutiveSummary Component
```typescript
// src/components/overview/ExecutiveSummary.tsx
// Replaces static placeholder in StrategicOverview.tsx
"use client";

import { BarChart3, Clock } from "lucide-react";
import { useExecutiveSummary } from "@/hooks/use-executive-summary";

export function ExecutiveSummary() {
  const { data, isPending, error } = useExecutiveSummary();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <BarChart3 className="text-brand-accent-blue" size={20} />
        3-Line Executive Summary
        {data?.cached && (
          <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
            <Clock size={12} /> cached
          </span>
        )}
      </h2>
      <div className="space-y-3 text-slate-700 leading-relaxed border-l-4 border-brand-accent-blue pl-4 font-medium">
        {isPending && <SummarySkeleton />}
        {error && !data && <p className="text-slate-400">AI Summary를 불러올 수 없습니다.</p>}
        {data?.lines.map((line, i) => <p key={i}>{line}</p>)}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` | `@google/genai` | May 2025 (GA) | New API surface: `ai.models.generateContent()` instead of `model.generateContent()` |
| Gemini 1.5 Flash | Gemini 2.5 Flash | Late 2024/2025 | Better reasoning, same free tier limits |
| Manual fetch to Gemini REST | Official SDK | May 2025 | Type-safe, handles auth and errors |

**Deprecated/outdated:**
- `@google/generative-ai`: EOL August 2025. Do not use. [CITED: CLAUDE.md]
- `gemini-pro` model name: Use `gemini-2.5-flash` for free tier usage. [CITED: CLAUDE.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | HTTP self-calls from API routes to other API routes cause issues in Vercel serverless | Anti-Patterns | Low -- if it works, it's just slightly less efficient. Direct function calls are still the better pattern. |
| A2 | `next build --turbopack` works with `@google/genai` package | Pitfall 5 | Medium -- fallback to `next build` without turbopack flag is simple |
| A3 | `temperature: 0.3` produces sufficiently consistent 3-line summaries | Code Examples | Low -- can tune after seeing output quality |

## Open Questions

1. **Vercel CLI not installed locally**
   - What we know: `vercel` command not found on the dev machine
   - What's unclear: Whether to deploy via CLI or Git integration
   - Recommendation: Use Vercel Git integration (connect GitHub repo) which requires no CLI. This is the standard approach and matches D-07 (basic setup).

2. **Data aggregation function extraction**
   - What we know: Existing routes use `buildTickerResponse` from `@/lib/yahoo-finance/quotes` and `fetchFearGreedIndex` from `@/lib/fear-greed/client`
   - What's unclear: Whether a new aggregation function can cleanly import all these without side effects
   - Recommendation: Create `src/lib/gemini/data-aggregator.ts` that imports from existing lib modules directly

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | v20.20.2 | -- |
| Next.js | Framework | Yes | 15.5.15 | -- |
| @google/genai | Gemini API | No (not yet installed) | 1.49.0 (npm) | `npm install @google/genai` |
| Vercel CLI | Deployment | No | -- | Use Vercel Git integration (recommended) |
| GEMINI_API_KEY | Gemini auth | No (.env.local not found) | -- | Must create .env.local with key |

**Missing dependencies with no fallback:**
- GEMINI_API_KEY must be obtained from Google AI Studio and set in .env.local (local) and Vercel dashboard (production)

**Missing dependencies with fallback:**
- Vercel CLI not needed -- Git integration is the standard deployment method
- @google/genai is a simple `npm install` during implementation

## Project Constraints (from CLAUDE.md)

- **SDK:** Must use `@google/genai`, NOT `@google/generative-ai` (deprecated, EOL Aug 2025)
- **Model:** Gemini 2.5 Flash (10 RPM, 250 daily requests free tier)
- **Data fetching:** yahoo-finance2 server-side only, via Next.js Route Handlers
- **Polling:** TanStack Query with refetchInterval
- **State:** Zustand for client state (not needed for this phase's core features)
- **Styling:** Tailwind CSS v4, Lucide-react icons
- **Design:** Premium Minimal Brutalism
- **Deployment:** Vercel with env var management
- **No Axios:** Use native fetch
- **No WebSocket:** HTTP polling pattern only
- **No DaisyUI/Tailwind UI:** Build components from utilities directly

## Sources

### Primary (HIGH confidence)
- [@google/genai npm registry](https://www.npmjs.com/package/@google/genai) - v1.49.0 verified [VERIFIED: npm registry]
- [Gemini API text generation docs](https://ai.google.dev/gemini-api/docs/text-generation?lang=node) - generateContent API with config.systemInstruction, temperature [CITED]
- Existing codebase: `src/app/api/market-data/route.ts`, `src/hooks/use-market-data.ts`, `src/components/overview/StrategicOverview.tsx` - established patterns [VERIFIED: codebase]
- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart) - SDK initialization pattern [CITED]

### Secondary (MEDIUM confidence)
- [googleapis/js-genai GitHub](https://github.com/googleapis/js-genai) - SDK repository and examples [CITED]

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - @google/genai version verified via npm, SDK API confirmed via official docs
- Architecture: HIGH - follows established codebase patterns exactly, Gemini SDK API is straightforward
- Pitfalls: MEDIUM - serverless caching behavior is well-understood but specific Turbopack compatibility is assumed

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days -- stable libraries, no fast-moving changes expected)
