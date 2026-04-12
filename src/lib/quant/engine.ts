import { QUANT_THRESHOLDS } from "@/lib/constants";

const { EPSILON } = QUANT_THRESHOLDS;

/**
 * Relative Strength: (종목 변동% / S&P500 변동%) * 100
 * D-09: 1D 기준. S&P 변동률 0일 때 기본값 100 반환.
 */
export function calculateRS(tickerChangePercent: number, spChangePercent: number): number {
  if (Math.abs(spChangePercent) < EPSILON) return 100;
  return (tickerChangePercent / spChangePercent) * 100;
}

/**
 * MA50 이격도: (현재가 - MA50) / MA50 * 100
 * MA50이 0일 때 안전하게 0 반환.
 */
export function calculateMA50Dist(currentPrice: number, ma50: number): number {
  if (Math.abs(ma50) < EPSILON) return 0;
  return ((currentPrice - ma50) / ma50) * 100;
}

/**
 * Drawdown: (현재가 - 52주 고가) / 52주 고가 * 100
 * 52주 고가가 0일 때 안전하게 0 반환.
 */
export function calculateDrawdown(currentPrice: number, high52w: number): number {
  if (Math.abs(high52w) < EPSILON) return 0;
  return ((currentPrice - high52w) / high52w) * 100;
}
