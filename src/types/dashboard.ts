import type { QuantMetrics, ActionSignal, Revision } from "@/lib/quant/types";

export type { ActionSignal, Revision } from "@/lib/quant/types";

export interface WatchlistItem extends QuantMetrics {
  symbol: string;
  price: number | null;
  change1D: number | null;     // 1D 변동률 (%)
  high52w: number | null;      // 52주 고가
  forwardPE: number | null;    // Forward P/E
  error?: string;              // D-02: 부분 실패 시 에러 메시지
}

export interface WatchlistResponse {
  data: (WatchlistItem | { symbol: string; error: string })[];
  timestamp: string;           // ISO 8601
}

export interface MarketDataItem {
  name: string;                // 표시명 (예: "S&P 500")
  symbol: string;              // Yahoo Finance 심볼
  price: number | null;
  change: number | null;       // 변동률 또는 텍스트 (Fear & Greed)
  changePercent: number | null;
  error?: string;
}

export interface FearGreedData {
  score: number;               // 0-100
  label: string;               // "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
  display: string;             // D-07: "42 (Fear)" 형태
}

export interface MarketDataResponse {
  data: MarketDataItem[];
  fearGreed: FearGreedData | null;
  timestamp: string;
}
