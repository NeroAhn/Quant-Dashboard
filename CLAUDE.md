<!-- GSD:project-start source:PROJECT.md -->
## Project

**Quant Strategist Pro Dashboard (Alpha Engine)**

18년 경력 시니어 매크로 전략가를 위한 **실시간 금융 대시보드**. 미국 주식 시장 및 매크로 지표를 직관적으로 센싱하고, 퀀트 기반의 기계적 대응 지표(Action Signals)를 제공하여 객관적 의사결정을 돕는다. Premium Minimal Brutalism 디자인 아이덴티티로 Vercel에 배포한다.

**Core Value:** 설정된 퀀트 로직(RS, MA50 이격도, Drawdown, Revision)에 따라 종목별 조건부 액션 시그널(Buy/Hold/Wait/Trim)을 자동 생성하여 기계적 대응을 가능케 한다.

### Constraints

- **Tech Stack**: Next.js + Tailwind CSS + Lucide-react + TanStack Query — PRD 지정
- **API 비용**: Yahoo Finance 무료 티어 한도 내 운용, Gemini API 무료 티어 활용
- **Rate Limiting**: 5분 갱신 주기로 API 호출 최적화
- **배포 환경**: Vercel (환경변수로 API 키 관리)
- **상태관리**: Zustand 또는 React Context API
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Architecture-Critical Decisions
### Why yahoo-finance2 MUST be Server-Side Only
### Why @google/genai, NOT @google/generative-ai
### Gemini API Free Tier Constraints
| Model | RPM | Daily Requests | Tokens/Min |
|-------|-----|----------------|------------|
| Gemini 2.5 Pro | 5 | 100 | 250K |
| Gemini 2.5 Flash | 10 | 250 | 250K |
| Gemini 2.5 Flash-Lite | 15 | 1,000 | 250K |
### TanStack Query Polling Configuration
### Zustand Store Structure
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
## Installation
# Initialize Next.js project
# Core dependencies
# Dev dependencies
### Environment Variables (.env.local)
# No Yahoo Finance key needed -- yahoo-finance2 works without one
## Version Pinning Strategy
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
