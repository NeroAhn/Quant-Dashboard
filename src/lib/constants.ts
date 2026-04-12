// PROJECT.md 기본 Watchlist 종목 (12개)
export const WATCHLIST_TICKERS = [
  "AAPL", "GOOGL", "META", "MSFT", "NVDA", "TSLA",
  "PLTR", "IONQ", "OKLO", "OXY", "V", "UNH",
] as const;

// PROJECT.md 기본 Monitoring 종목 (9개)
export const MONITORING_TICKERS = [
  "MU", "AMZN", "NFLX", "CEG", "SO", "NEE", "BRK-B", "LLY", "JNJ",
] as const;

// D-01: Market Data 심볼 매핑 (6개 지수/자산)
export const MARKET_SYMBOLS = {
  "S&P 500": "^GSPC",
  "NASDAQ": "^IXIC",
  "BTC": "BTC-USD",
  "GOLD": "GC=F",
  "10Y Yield": "^TNX",
  "DXY": "DX-Y.NYB",
} as const;

export type MarketName = keyof typeof MARKET_SYMBOLS;

// 퀀트 엔진 임계값 (QENG-04: 부동소수점 비교용)
export const QUANT_THRESHOLDS = {
  RS_BUY: 110,
  RS_TRIM: 130,
  RS_WAIT: 90,
  MA50_BUY: 5,
  MA50_TRIM: 12,
  EPSILON: 1e-10,
} as const;

// Macro 경고 임계값 (TAB1-04, Phase 2에서 UI 사용)
export const MACRO_THRESHOLDS = {
  YIELD_10Y_WARNING: 4.5,
  DXY_WARNING: 106.0,
  FEAR_GREED_WARNING: 30,
} as const;

// Fear & Greed 라벨 매핑
export const FEAR_GREED_LABELS: Record<string, [number, number]> = {
  "Extreme Fear": [0, 24],
  "Fear": [25, 44],
  "Neutral": [45, 55],
  "Greed": [56, 74],
  "Extreme Greed": [75, 100],
};
