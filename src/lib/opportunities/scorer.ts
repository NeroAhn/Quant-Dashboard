import type { BroadSector } from "./universe";

export interface OpportunityCandidate {
  symbol: string;
  sector: BroadSector;
  price: number;
  change1D: number | null;
  high52w: number;
  drawdown: number; // negative percent, e.g. -25.4
  forwardPE: number; // positive
  marketCap: number;
}

export interface OpportunityRanked extends OpportunityCandidate {
  oppScore: number; // 0..100
  drawdownPercentile: number; // 0..1
  peInversePercentile: number; // 0..1
}

export const OPP_FILTERS = {
  DRAWDOWN_MAX: -20, // drawdown must be <= -20%
  FORWARD_PE_MIN: 0,
  FORWARD_PE_MAX: 50,
  MARKET_CAP_MIN: 2_000_000_000, // $2B
} as const;

export const OPP_WEIGHTS = {
  DRAWDOWN: 0.5,
  PE: 0.5,
} as const;

export const SECTOR_CAP = 5;
export const TOP_N = 30;

/**
 * Compute percentile rank (0..1) for each value within the array.
 * Higher value → higher percentile. Ties share the average rank.
 */
function percentileRanks(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);

  const ranks = new Array<number>(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && indexed[j + 1].v === indexed[i].v) j++;
    const avgRank = (i + j) / 2; // 0-based average rank
    const pct = n === 1 ? 1 : avgRank / (n - 1);
    for (let k = i; k <= j; k++) ranks[indexed[k].i] = pct;
    i = j + 1;
  }
  return ranks;
}

export function scoreAndRank(
  candidates: OpportunityCandidate[],
): OpportunityRanked[] {
  if (candidates.length === 0) return [];

  // For drawdown: more negative = better → use -drawdown so larger = better
  const drawdownScores = candidates.map((c) => -c.drawdown);
  // For P/E: lower = better → use 1/PE so larger = better
  const peInverseScores = candidates.map((c) => 1 / c.forwardPE);

  const drawdownPcts = percentileRanks(drawdownScores);
  const pePcts = percentileRanks(peInverseScores);

  const ranked: OpportunityRanked[] = candidates.map((c, i) => ({
    ...c,
    drawdownPercentile: drawdownPcts[i],
    peInversePercentile: pePcts[i],
    oppScore:
      100 *
      (OPP_WEIGHTS.DRAWDOWN * drawdownPcts[i] +
        OPP_WEIGHTS.PE * pePcts[i]),
  }));

  ranked.sort((a, b) => b.oppScore - a.oppScore);
  return ranked;
}

/**
 * Apply sector diversity cap — keep top N while limiting per-sector count.
 */
export function applySectorCap(
  ranked: OpportunityRanked[],
  topN: number = TOP_N,
  capPerSector: number = SECTOR_CAP,
): OpportunityRanked[] {
  const result: OpportunityRanked[] = [];
  const sectorCount = new Map<BroadSector, number>();

  for (const item of ranked) {
    if (result.length >= topN) break;
    const cur = sectorCount.get(item.sector) ?? 0;
    if (cur >= capPerSector) continue;
    result.push(item);
    sectorCount.set(item.sector, cur + 1);
  }
  return result;
}

export function passesFilter(args: {
  drawdown: number | null;
  forwardPE: number | null;
  marketCap: number | null;
}): boolean {
  if (args.drawdown == null || args.forwardPE == null || args.marketCap == null) {
    return false;
  }
  if (args.drawdown > OPP_FILTERS.DRAWDOWN_MAX) return false;
  if (args.forwardPE <= OPP_FILTERS.FORWARD_PE_MIN) return false;
  if (args.forwardPE >= OPP_FILTERS.FORWARD_PE_MAX) return false;
  if (args.marketCap < OPP_FILTERS.MARKET_CAP_MIN) return false;
  return true;
}
