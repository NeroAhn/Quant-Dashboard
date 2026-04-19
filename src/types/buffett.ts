import type { BroadSector } from "@/lib/opportunities/universe";
import type { OwnerEarningsEntry, RoeHistoryEntry } from "@/lib/buffett/metrics";

export interface BuffettMetrics {
  symbol: string;
  name: string;
  sector: BroadSector;

  // Current snapshot
  price: number;
  marketCap: number;
  change1D: number | null;

  // Core Buffett metrics
  marginOfSafety: number | null; // negative = undervalued fraction
  intrinsicPerShare: number | null;
  usedGrowthRate: number | null;

  avgRoe4y: number | null; // fraction
  roeHistory: RoeHistoryEntry[];
  allYearsRoeAbove15: boolean; // every year in history ≥ 15%

  debtToEarningsYears: number | null;
  rsi14: number | null;

  ownerEarnings: OwnerEarningsEntry[];

  // Pick evaluation (all four must pass)
  pick: {
    mosPass: boolean; // MoS ≤ -30%
    roePass: boolean; // every year ≥ 15%
    debtPass: boolean; // D/E years < 3
    rsiPass: boolean; // RSI < 30
    all: boolean;
  };

  // Filter funnel result (when called from Opp)
  passesFilterFunnel?: boolean;
  exclusionReason?: string;

  // Attached after generation
  memo?: string;
}
