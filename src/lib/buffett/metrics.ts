export interface YearlyIncome {
  year: number;
  netIncome: number;
  operatingIncome: number;
}

export interface YearlyBalance {
  year: number;
  stockholdersEquity: number;
  totalDebt: number;
  totalCash: number;
}

export interface YearlyCashflow {
  year: number;
  operatingCashflow: number;
  capitalExpenditures: number; // negative per convention
  depreciation: number;
  netIncome: number;
}

export interface RoeHistoryEntry {
  year: number;
  roe: number; // fraction (e.g. 0.18 = 18%)
}

export interface OwnerEarningsEntry {
  year: number;
  netIncome: number;
  ownerEarnings: number;
}

/**
 * Compute yearly ROE = netIncome / stockholdersEquity (fraction).
 * Skips years with missing or non-positive equity.
 */
export function computeRoeHistory(
  income: YearlyIncome[],
  balance: YearlyBalance[],
): RoeHistoryEntry[] {
  const bsByYear = new Map(balance.map((b) => [b.year, b]));
  const entries: RoeHistoryEntry[] = [];
  for (const i of income) {
    const b = bsByYear.get(i.year);
    if (!b || b.stockholdersEquity <= 0) continue;
    entries.push({ year: i.year, roe: i.netIncome / b.stockholdersEquity });
  }
  entries.sort((a, b) => a.year - b.year);
  return entries;
}

export function averageRoe(history: RoeHistoryEntry[]): number | null {
  if (history.length === 0) return null;
  const sum = history.reduce((acc, h) => acc + h.roe, 0);
  return sum / history.length;
}

/**
 * Debt-to-Earnings in years = netDebt / avgNetIncome (last N years).
 * Positive means company needs that many years of net income to clear debt.
 * If net cash (negative netDebt), returns 0.
 */
export function debtToEarningsYears(
  latestBalance: YearlyBalance,
  income: YearlyIncome[],
  avgYears: number = 3,
): number | null {
  const recent = [...income].sort((a, b) => b.year - a.year).slice(0, avgYears);
  if (recent.length === 0) return null;
  const positiveCount = recent.filter((r) => r.netIncome > 0).length;
  if (positiveCount === 0) return null;
  const avgNetIncome =
    recent.reduce((acc, r) => acc + r.netIncome, 0) / recent.length;
  if (avgNetIncome <= 0) return null;

  const netDebt = latestBalance.totalDebt - latestBalance.totalCash;
  if (netDebt <= 0) return 0;
  return netDebt / avgNetIncome;
}

/**
 * Owner Earnings = NetIncome + Depreciation - CAPEX.
 * CAPEX is stored as negative number in yahoo so we add its absolute value
 * when subtracting (i.e., netIncome + depreciation + capex).
 */
export function ownerEarningsHistory(
  cashflow: YearlyCashflow[],
): OwnerEarningsEntry[] {
  return cashflow
    .map((c) => ({
      year: c.year,
      netIncome: c.netIncome,
      ownerEarnings:
        c.netIncome + (c.depreciation || 0) + (c.capitalExpenditures || 0),
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * FCF per year from cashflow history: operatingCashflow + capitalExpenditures.
 * (CAPEX is negative, so adding it subtracts spending.)
 */
export function fcfHistory(
  cashflow: YearlyCashflow[],
): Array<{ year: number; fcf: number }> {
  return cashflow
    .map((c) => ({
      year: c.year,
      fcf: c.operatingCashflow + (c.capitalExpenditures || 0),
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Check that latest N years all have positive netIncome AND operatingIncome.
 */
export function hasConsecutivePositiveIncome(
  income: YearlyIncome[],
  years: number = 3,
): boolean {
  const recent = [...income].sort((a, b) => b.year - a.year).slice(0, years);
  if (recent.length < years) return false;
  return recent.every((r) => r.netIncome > 0 && r.operatingIncome > 0);
}
