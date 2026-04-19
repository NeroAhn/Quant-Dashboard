/**
 * Buffett-style industry exclusions.
 *
 * Excluded categories:
 * 1. Complex / speculative biotech with single-drug pipeline risk.
 * 2. Meme / crypto / hype plays with disconnected valuations.
 *
 * Kept: diversified mega-pharma (AMGN, GILD), medical devices (ISRG, DXCM,
 * IDXX, GEHC) — durable moats with predictable cash flows.
 */
export const BUFFETT_EXCLUDED: Record<string, string> = {
  // Complex / speculative biotech
  MRNA: "complex biotech — mRNA pipeline uncertainty",
  BIIB: "complex biotech — neurology pipeline volatility",
  VRTX: "complex biotech — single-franchise concentration risk",
  REGN: "complex biotech — pipeline-driven",
  INCY: "complex biotech — small-cap biotech",
  BMRN: "complex biotech — rare-disease pipeline",
  ILMN: "speculative genomics — unpredictable earnings",

  // Meme / crypto / extreme-hype plays
  MSTR: "crypto proxy — bitcoin-leveraged treasury",
  COIN: "crypto exchange — speculative cycle",
  PLTR: "extreme-valuation AI hype — P/E detached from fundamentals",
  SMCI: "AI hype + accounting concerns",
  GFS: "speculative specialty semi — volatile earnings",

  // Unprofitable / recent IPO meme
  // (Most of these are already excluded by the 3yr positive income filter,
  //  but listing them here makes intent explicit and stable across re-runs.)
};

export function isExcluded(symbol: string): { excluded: boolean; reason?: string } {
  const reason = BUFFETT_EXCLUDED[symbol];
  return reason ? { excluded: true, reason } : { excluded: false };
}
