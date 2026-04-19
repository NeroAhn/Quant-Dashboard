import yahooFinance from "@/lib/yahoo-finance/client";
import { calculateRSI } from "./rsi";
import { runDCF, fcfCagr } from "./dcf";
import {
  hasConsecutivePositiveIncome,
  type YearlyIncome,
} from "./metrics";
import type { BroadSector } from "@/lib/opportunities/universe";
import type { BuffettMetrics } from "@/types/buffett";
import type { RoeHistoryEntry } from "./metrics";

const HISTORICAL_LOOKBACK_DAYS = 90;

function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (typeof v === "object" && "raw" in (v as Record<string, unknown>)) {
    const raw = (v as { raw?: unknown }).raw;
    return typeof raw === "number" && isFinite(raw) ? raw : null;
  }
  return null;
}

function toYear(v: unknown): number | null {
  if (!v) return null;
  if (v instanceof Date) return v.getUTCFullYear();
  if (typeof v === "number")
    return new Date(v < 1e12 ? v * 1000 : v).getUTCFullYear();
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d.getUTCFullYear();
  }
  if (typeof v === "object" && "raw" in (v as Record<string, unknown>)) {
    const raw = (v as { raw?: unknown }).raw;
    if (typeof raw === "number")
      return new Date(raw < 1e12 ? raw * 1000 : raw).getUTCFullYear();
  }
  return null;
}

export interface BuffettFetchInput {
  symbol: string;
  sector: BroadSector;
}

export interface BuffettFetchResult {
  metrics: BuffettMetrics | null;
  has3yrPositiveIncome: boolean;
  marketCap: number | null;
  error?: string;
}

/**
 * Yahoo's free quoteSummary often returns sparse data:
 *  - balanceSheetHistory and cashflowStatementHistory arrays are frequently
 *    populated only with endDate + netIncome (rest null).
 *  - operatingIncome is usually null in incomeStatementHistory.
 *  - financialData, however, reliably exposes *current* snapshots of
 *    totalDebt, totalCash, freeCashflow, returnOnEquity, operatingCashflow,
 *    grossMargins.
 *
 * This fetcher therefore uses financialData as the primary source for
 * balance-sheet and cash-flow values, and incomeStatementHistory just for
 * the 3-year positive-netIncome gate and for a net-income based growth
 * fallback. ROE is the current point value (Yahoo doesn't expose historical
 * equity in the free tier reliably).
 */
export async function fetchBuffettData(
  input: BuffettFetchInput,
): Promise<BuffettFetchResult> {
  const { symbol, sector } = input;
  try {
    const [quote, summary, history] = await Promise.all([
      yahooFinance.quote(symbol).catch(() => null),
      yahooFinance
        .quoteSummary(symbol, {
          modules: [
            "financialData",
            "defaultKeyStatistics",
            "incomeStatementHistory",
            "earningsTrend",
            "summaryDetail",
          ],
        })
        .catch(() => null),
      yahooFinance
        .historical(symbol, {
          period1: new Date(Date.now() - HISTORICAL_LOOKBACK_DAYS * 86400_000),
          interval: "1d",
        })
        .catch(() => null),
    ]);

    if (!quote || !summary) {
      return { metrics: null, has3yrPositiveIncome: false, marketCap: null };
    }

    const price = quote.regularMarketPrice ?? null;
    const marketCap = quote.marketCap ?? null;
    const change1D = quote.regularMarketChangePercent ?? null;
    const name =
      (quote.shortName as string | undefined) ??
      (quote.longName as string | undefined) ??
      symbol;

    if (price == null || marketCap == null) {
      return { metrics: null, has3yrPositiveIncome: false, marketCap };
    }

    // Income statements: use for 3-year positive income gate.
    const incomeStmts =
      (summary as {
        incomeStatementHistory?: {
          incomeStatementHistory?: Array<{
            endDate?: unknown;
            netIncome?: unknown;
            operatingIncome?: unknown;
          }>;
        };
      }).incomeStatementHistory?.incomeStatementHistory ?? [];

    const incomeList: YearlyIncome[] = incomeStmts
      .map((i) => {
        const y = toYear(i.endDate);
        const ni = toNum(i.netIncome);
        const oi = toNum(i.operatingIncome) ?? ni ?? 0;
        if (y == null || ni == null) return null;
        return { year: y, netIncome: ni, operatingIncome: oi };
      })
      .filter((x): x is YearlyIncome => x !== null);

    // financialData — current snapshots (reliable fields)
    const financial = (summary as {
      financialData?: {
        totalCash?: unknown;
        totalDebt?: unknown;
        freeCashflow?: unknown;
        operatingCashflow?: unknown;
        returnOnEquity?: unknown;
      };
    }).financialData ?? {};
    const totalCash = toNum(financial.totalCash) ?? 0;
    const totalDebt = toNum(financial.totalDebt) ?? 0;
    const freeCashflow = toNum(financial.freeCashflow);
    const currentROE = toNum(financial.returnOnEquity);

    const sharesOutstanding = toNum(
      (summary as {
        defaultKeyStatistics?: { sharesOutstanding?: unknown };
      }).defaultKeyStatistics?.sharesOutstanding,
    ) ?? quote.sharesOutstanding ?? null;

    // Analyst 5yr growth (if available)
    const trend = (summary as {
      earningsTrend?: {
        trend?: Array<{ period?: string; growth?: unknown }>;
      };
    }).earningsTrend?.trend ?? [];
    const analystGrowth = toNum(
      trend.find((t) => t.period === "+5y")?.growth,
    );

    // Net-income CAGR as secondary growth signal (from incomeStatementHistory)
    const netIncomeSortedOldFirst = [...incomeList]
      .sort((a, b) => a.year - b.year)
      .map((i) => i.netIncome);
    const niCagr = fcfCagr(netIncomeSortedOldFirst);

    // DCF: use free cash flow from financialData as trailing FCF base
    let mos: number | null = null;
    let intrinsicPerShare: number | null = null;
    let usedGrowth: number | null = null;
    if (freeCashflow != null && sharesOutstanding != null) {
      const dcf = runDCF({
        baseFcf: freeCashflow,
        growthRate: analystGrowth,
        fcfHistoryCagr: niCagr,
        sharesOutstanding,
        totalCash,
        totalDebt,
        currentPrice: price,
      });
      if (dcf) {
        mos = dcf.marginOfSafety;
        intrinsicPerShare = dcf.intrinsicPerShare;
        usedGrowth = dcf.usedGrowthRate;
      }
    }

    // Debt-to-Earnings: net debt / 3yr avg netIncome
    const recentNetIncomes = [...incomeList]
      .sort((a, b) => b.year - a.year)
      .slice(0, 3)
      .map((i) => i.netIncome);
    const avg3yrNi =
      recentNetIncomes.length > 0
        ? recentNetIncomes.reduce((a, b) => a + b, 0) / recentNetIncomes.length
        : null;
    let dtoEYears: number | null = null;
    const netDebt = totalDebt - totalCash;
    if (netDebt <= 0) {
      dtoEYears = 0;
    } else if (avg3yrNi != null && avg3yrNi > 0) {
      dtoEYears = netDebt / avg3yrNi;
    }

    // ROE: Yahoo only reliably gives current (returnOnEquity from financialData)
    const roeHistory: RoeHistoryEntry[] =
      currentROE != null
        ? [{ year: new Date().getUTCFullYear(), roe: currentROE }]
        : [];
    const avgRoe = currentROE;
    // With only current ROE, consistency check reduces to "current ≥ 15%"
    const roeAbove15 = currentROE != null && currentROE >= 0.15;

    // RSI from historical closes
    const closes: number[] =
      history
        ?.map((h) => h.close)
        .filter((v): v is number => typeof v === "number" && isFinite(v)) ?? [];
    const rsi14 = calculateRSI(closes, 14);

    // Pick evaluation
    const mosPass = mos != null && mos <= -0.30;
    const roePass = roeAbove15;
    const debtPass = dtoEYears != null && dtoEYears < 3.0;
    const rsiPass = rsi14 != null && rsi14 < 30;

    const metrics: BuffettMetrics = {
      symbol,
      name,
      sector,
      price,
      marketCap,
      change1D,
      marginOfSafety: mos,
      intrinsicPerShare,
      usedGrowthRate: usedGrowth,
      avgRoe4y: avgRoe,
      roeHistory,
      allYearsRoeAbove15: roeAbove15,
      debtToEarningsYears: dtoEYears,
      rsi14,
      ownerEarnings: [],
      pick: {
        mosPass,
        roePass,
        debtPass,
        rsiPass,
        all: mosPass && roePass && debtPass && rsiPass,
      },
    };

    return {
      metrics,
      has3yrPositiveIncome: hasConsecutivePositiveIncome(incomeList, 3),
      marketCap,
    };
  } catch (error) {
    return {
      metrics: null,
      has3yrPositiveIncome: false,
      marketCap: null,
      error: error instanceof Error ? error.message : "fetch failed",
    };
  }
}
