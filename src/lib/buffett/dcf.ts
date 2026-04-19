/**
 * Simplified 10-year DCF intrinsic-value calculator.
 * Yahoo's free-tier financials give us only 4 years so this implementation:
 *  - uses trailing FCF as the base cash flow,
 *  - uses analyst 5-yr growth estimate when available (clamped to -5%..20%),
 *  - falls back to 4-yr FCF CAGR, then to a conservative 5% default,
 *  - applies a 10% discount rate and 2.5% terminal growth.
 */

export interface DCFInput {
  baseFcf: number; // latest annual FCF, USD
  growthRate: number | null; // analyst 5yr growth fraction (0.12 = 12%)
  fcfHistoryCagr: number | null; // 4-yr FCF CAGR fraction, fallback
  sharesOutstanding: number; // common shares outstanding
  totalCash: number; // from balance sheet
  totalDebt: number; // from balance sheet
  currentPrice: number;
}

export interface DCFResult {
  intrinsicPerShare: number;
  intrinsicEquity: number;
  usedGrowthRate: number;
  marginOfSafety: number; // (price / intrinsic) - 1 (negative = undervalued)
}

const DISCOUNT_RATE = 0.10;
const TERMINAL_GROWTH = 0.025;
const PROJECTION_YEARS = 10;
const GROWTH_MIN = -0.05;
const GROWTH_MAX = 0.20;
const DEFAULT_GROWTH = 0.05;

function clampGrowth(g: number): number {
  if (!isFinite(g)) return DEFAULT_GROWTH;
  return Math.max(GROWTH_MIN, Math.min(GROWTH_MAX, g));
}

function pickGrowthRate(
  analyst: number | null,
  cagr: number | null,
): number {
  if (analyst != null && isFinite(analyst)) return clampGrowth(analyst);
  if (cagr != null && isFinite(cagr)) return clampGrowth(cagr);
  return DEFAULT_GROWTH;
}

export function runDCF(input: DCFInput): DCFResult | null {
  if (!isFinite(input.baseFcf) || input.baseFcf <= 0) return null;
  if (!isFinite(input.sharesOutstanding) || input.sharesOutstanding <= 0)
    return null;
  if (!isFinite(input.currentPrice) || input.currentPrice <= 0) return null;

  const g = pickGrowthRate(input.growthRate, input.fcfHistoryCagr);
  const r = DISCOUNT_RATE;

  let pvProjected = 0;
  let fcfYearN = input.baseFcf;
  for (let t = 1; t <= PROJECTION_YEARS; t++) {
    fcfYearN = fcfYearN * (1 + g);
    pvProjected += fcfYearN / Math.pow(1 + r, t);
  }

  if (r <= TERMINAL_GROWTH) return null;
  const terminalValue =
    (fcfYearN * (1 + TERMINAL_GROWTH)) / (r - TERMINAL_GROWTH);
  const pvTerminal = terminalValue / Math.pow(1 + r, PROJECTION_YEARS);

  const enterpriseIntrinsic = pvProjected + pvTerminal;
  const netCash = input.totalCash - input.totalDebt;
  const equityIntrinsic = enterpriseIntrinsic + netCash;
  const perShare = equityIntrinsic / input.sharesOutstanding;

  if (!isFinite(perShare) || perShare <= 0) return null;

  const marginOfSafety = input.currentPrice / perShare - 1;

  return {
    intrinsicPerShare: perShare,
    intrinsicEquity: equityIntrinsic,
    usedGrowthRate: g,
    marginOfSafety,
  };
}

/**
 * Compute 4-year FCF CAGR from a series ordered oldest→newest.
 * Returns null if fewer than 2 valid positive points or negative endpoints.
 */
export function fcfCagr(series: number[]): number | null {
  const valid = series.filter((v) => isFinite(v) && v > 0);
  if (valid.length < 2) return null;
  const first = valid[0];
  const last = valid[valid.length - 1];
  const years = valid.length - 1;
  const cagr = Math.pow(last / first, 1 / years) - 1;
  return isFinite(cagr) ? cagr : null;
}
