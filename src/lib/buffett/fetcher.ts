import yahooFinance from "@/lib/yahoo-finance/client";
import { calculateRSI } from "./rsi";
import { runDCF, fcfCagr } from "./dcf";
import {
  computeRoeHistory,
  averageRoe,
  debtToEarningsYears,
  ownerEarningsHistory,
  fcfHistory,
  hasConsecutivePositiveIncome,
  type YearlyIncome,
  type YearlyBalance,
  type YearlyCashflow,
} from "./metrics";
import type { BroadSector } from "@/lib/opportunities/universe";
import type { BuffettMetrics } from "@/types/buffett";

const HISTORICAL_LOOKBACK_DAYS = 90;

interface QuoteSummaryStatement {
  endDate?: { raw?: number } | Date | number | null;
}
interface IncomeStmt extends QuoteSummaryStatement {
  netIncome?: { raw?: number } | number | null;
  operatingIncome?: { raw?: number } | number | null;
}
interface BalanceStmt extends QuoteSummaryStatement {
  totalStockholderEquity?: { raw?: number } | number | null;
  totalDebt?: { raw?: number } | number | null;
  cash?: { raw?: number } | number | null;
  shortLongTermDebt?: { raw?: number } | number | null;
  longTermDebt?: { raw?: number } | number | null;
  shortTermDebt?: { raw?: number } | number | null;
}
interface CashflowStmt extends QuoteSummaryStatement {
  totalCashFromOperatingActivities?: { raw?: number } | number | null;
  capitalExpenditures?: { raw?: number } | number | null;
  depreciation?: { raw?: number } | number | null;
  netIncome?: { raw?: number } | number | null;
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (typeof v === "object" && "raw" in (v as Record<string, unknown>)) {
    const raw = (v as { raw?: unknown }).raw;
    return typeof raw === "number" && isFinite(raw) ? raw : null;
  }
  return null;
}

function endYear(stmt: QuoteSummaryStatement): number | null {
  const end = stmt.endDate;
  if (!end) return null;
  if (end instanceof Date) return end.getUTCFullYear();
  if (typeof end === "number")
    return new Date(end < 1e12 ? end * 1000 : end).getUTCFullYear();
  if (typeof end === "object" && "raw" in end) {
    const raw = (end as { raw?: number }).raw;
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
  // Separate flag for funnel usage
  has3yrPositiveIncome: boolean;
  marketCap: number | null;
  error?: string;
}

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
            "balanceSheetHistory",
            "cashflowStatementHistory",
            "earningsTrend",
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

    const incomeRaw = (summary as { incomeStatementHistory?: { incomeStatementHistory?: IncomeStmt[] } })
      .incomeStatementHistory?.incomeStatementHistory ?? [];
    const balanceRaw = (summary as { balanceSheetHistory?: { balanceSheetStatements?: BalanceStmt[] } })
      .balanceSheetHistory?.balanceSheetStatements ?? [];
    const cashflowRaw = (summary as { cashflowStatementHistory?: { cashflowStatements?: CashflowStmt[] } })
      .cashflowStatementHistory?.cashflowStatements ?? [];

    const incomeList: YearlyIncome[] = incomeRaw
      .map((i) => {
        const y = endYear(i);
        const ni = toNum(i.netIncome);
        const oi = toNum(i.operatingIncome);
        if (y == null || ni == null || oi == null) return null;
        return { year: y, netIncome: ni, operatingIncome: oi };
      })
      .filter((x): x is YearlyIncome => x !== null);

    const balanceList: YearlyBalance[] = balanceRaw
      .map((b) => {
        const y = endYear(b);
        const eq = toNum(b.totalStockholderEquity);
        let totalDebt = toNum(b.totalDebt);
        if (totalDebt == null) {
          const lt = toNum(b.longTermDebt) ?? 0;
          const st =
            toNum(b.shortTermDebt) ?? toNum(b.shortLongTermDebt) ?? 0;
          totalDebt = lt + st;
        }
        const cash = toNum(b.cash) ?? 0;
        if (y == null || eq == null || totalDebt == null) return null;
        return {
          year: y,
          stockholdersEquity: eq,
          totalDebt,
          totalCash: cash,
        };
      })
      .filter((x): x is YearlyBalance => x !== null);

    const cashflowList: YearlyCashflow[] = cashflowRaw
      .map((c) => {
        const y = endYear(c);
        const ocf = toNum(c.totalCashFromOperatingActivities);
        const capex = toNum(c.capitalExpenditures) ?? 0;
        const dep = toNum(c.depreciation) ?? 0;
        const ni = toNum(c.netIncome) ?? 0;
        if (y == null || ocf == null) return null;
        return {
          year: y,
          operatingCashflow: ocf,
          capitalExpenditures: capex,
          depreciation: dep,
          netIncome: ni,
        };
      })
      .filter((x): x is YearlyCashflow => x !== null);

    // Buffett metrics
    const roeHistory = computeRoeHistory(incomeList, balanceList);
    const avgRoe4y = averageRoe(roeHistory);
    const allYearsRoeAbove15 =
      roeHistory.length >= 3 && roeHistory.every((h) => h.roe >= 0.15);

    const latestBalance = [...balanceList].sort((a, b) => b.year - a.year)[0];
    const dtoEYears = latestBalance
      ? debtToEarningsYears(latestBalance, incomeList, 3)
      : null;

    const ownerHist = ownerEarningsHistory(cashflowList);
    const fcfs = fcfHistory(cashflowList);
    const sortedByYear = [...fcfs].sort((a, b) => a.year - b.year);
    const baseFcf = sortedByYear.length
      ? sortedByYear[sortedByYear.length - 1].fcf
      : null;
    const cagr = fcfCagr(sortedByYear.map((f) => f.fcf));

    // Pull analyst growth estimate from earningsTrend "+5y" entry
    const trend = (summary as {
      earningsTrend?: {
        trend?: Array<{
          period?: string;
          growth?: { raw?: number } | number | null;
        }>;
      };
    }).earningsTrend?.trend ?? [];
    const fiveY = trend.find((t) => t.period === "+5y");
    const analystGrowth = fiveY ? toNum(fiveY.growth) : null;

    // Shares outstanding
    const sharesOutstanding = toNum(
      (summary as {
        defaultKeyStatistics?: {
          sharesOutstanding?: { raw?: number } | number | null;
        };
      }).defaultKeyStatistics?.sharesOutstanding,
    ) ?? quote.sharesOutstanding ?? null;

    const totalCash = latestBalance?.totalCash ?? 0;
    const totalDebt = latestBalance?.totalDebt ?? 0;

    let mos: number | null = null;
    let intrinsicPerShare: number | null = null;
    let usedGrowth: number | null = null;
    if (baseFcf != null && sharesOutstanding != null) {
      const dcf = runDCF({
        baseFcf,
        growthRate: analystGrowth,
        fcfHistoryCagr: cagr,
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

    // RSI
    const closes: number[] =
      history?.map((h) => h.close).filter((v): v is number => typeof v === "number" && isFinite(v)) ??
      [];
    const rsi14 = calculateRSI(closes, 14);

    // Pick evaluation
    const mosPass = mos != null && mos <= -0.30;
    const roePass = allYearsRoeAbove15;
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
      avgRoe4y,
      roeHistory,
      allYearsRoeAbove15,
      debtToEarningsYears: dtoEYears,
      rsi14,
      ownerEarnings: ownerHist,
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
