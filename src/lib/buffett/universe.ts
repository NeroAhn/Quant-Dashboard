import type { BroadSector } from "@/lib/opportunities/universe";

export interface NasdaqEntry {
  symbol: string;
  sector: BroadSector;
}

/**
 * NASDAQ-100 constituents (approximate as of 2026-04).
 * Used as the base universe for Buffett-style filtering.
 */
export const NASDAQ_100: readonly NasdaqEntry[] = [
  // Technology
  { symbol: "AAPL", sector: "Technology" },
  { symbol: "MSFT", sector: "Technology" },
  { symbol: "NVDA", sector: "Technology" },
  { symbol: "AVGO", sector: "Technology" },
  { symbol: "ADBE", sector: "Technology" },
  { symbol: "CSCO", sector: "Technology" },
  { symbol: "AMD", sector: "Technology" },
  { symbol: "INTU", sector: "Technology" },
  { symbol: "QCOM", sector: "Technology" },
  { symbol: "TXN", sector: "Technology" },
  { symbol: "AMAT", sector: "Technology" },
  { symbol: "LRCX", sector: "Technology" },
  { symbol: "KLAC", sector: "Technology" },
  { symbol: "MU", sector: "Technology" },
  { symbol: "ADI", sector: "Technology" },
  { symbol: "PANW", sector: "Technology" },
  { symbol: "CRWD", sector: "Technology" },
  { symbol: "FTNT", sector: "Technology" },
  { symbol: "ASML", sector: "Technology" },
  { symbol: "NXPI", sector: "Technology" },
  { symbol: "MRVL", sector: "Technology" },
  { symbol: "SNPS", sector: "Technology" },
  { symbol: "CDNS", sector: "Technology" },
  { symbol: "ADSK", sector: "Technology" },
  { symbol: "WDAY", sector: "Technology" },
  { symbol: "TEAM", sector: "Technology" },
  { symbol: "MCHP", sector: "Technology" },
  { symbol: "MDB", sector: "Technology" },
  { symbol: "DDOG", sector: "Technology" },
  { symbol: "ROP", sector: "Technology" },
  { symbol: "CTSH", sector: "Technology" },
  { symbol: "CDW", sector: "Technology" },
  { symbol: "ZS", sector: "Technology" },
  { symbol: "ANSS", sector: "Technology" },
  { symbol: "ON", sector: "Technology" },
  { symbol: "ARM", sector: "Technology" },
  { symbol: "TTD", sector: "Technology" },
  { symbol: "APP", sector: "Technology" },
  { symbol: "GFS", sector: "Technology" },
  { symbol: "SMCI", sector: "Technology" },
  { symbol: "PLTR", sector: "Technology" },

  // Communication Services
  { symbol: "GOOGL", sector: "Communication Services" },
  { symbol: "GOOG", sector: "Communication Services" },
  { symbol: "META", sector: "Communication Services" },
  { symbol: "NFLX", sector: "Communication Services" },
  { symbol: "TMUS", sector: "Communication Services" },
  { symbol: "CMCSA", sector: "Communication Services" },
  { symbol: "CHTR", sector: "Communication Services" },
  { symbol: "WBD", sector: "Communication Services" },
  { symbol: "EA", sector: "Communication Services" },

  // Consumer Discretionary
  { symbol: "AMZN", sector: "Consumer Discretionary" },
  { symbol: "TSLA", sector: "Consumer Discretionary" },
  { symbol: "BKNG", sector: "Consumer Discretionary" },
  { symbol: "SBUX", sector: "Consumer Discretionary" },
  { symbol: "MAR", sector: "Consumer Discretionary" },
  { symbol: "ORLY", sector: "Consumer Discretionary" },
  { symbol: "ROST", sector: "Consumer Discretionary" },
  { symbol: "LULU", sector: "Consumer Discretionary" },
  { symbol: "ABNB", sector: "Consumer Discretionary" },
  { symbol: "DASH", sector: "Consumer Discretionary" },
  { symbol: "MELI", sector: "Consumer Discretionary" },
  { symbol: "PDD", sector: "Consumer Discretionary" },

  // Consumer Staples
  { symbol: "COST", sector: "Consumer Staples" },
  { symbol: "PEP", sector: "Consumer Staples" },
  { symbol: "MDLZ", sector: "Consumer Staples" },
  { symbol: "KDP", sector: "Consumer Staples" },
  { symbol: "KHC", sector: "Consumer Staples" },
  { symbol: "MNST", sector: "Consumer Staples" },

  // Healthcare
  { symbol: "AMGN", sector: "Healthcare" },
  { symbol: "ISRG", sector: "Healthcare" },
  { symbol: "GILD", sector: "Healthcare" },
  { symbol: "REGN", sector: "Healthcare" },
  { symbol: "VRTX", sector: "Healthcare" },
  { symbol: "BIIB", sector: "Healthcare" },
  { symbol: "INCY", sector: "Healthcare" },
  { symbol: "ILMN", sector: "Healthcare" },
  { symbol: "MRNA", sector: "Healthcare" },
  { symbol: "BMRN", sector: "Healthcare" },
  { symbol: "DXCM", sector: "Healthcare" },
  { symbol: "GEHC", sector: "Healthcare" },
  { symbol: "IDXX", sector: "Healthcare" },
  { symbol: "AZN", sector: "Healthcare" },

  // Industrials
  { symbol: "HON", sector: "Industrials" },
  { symbol: "CSX", sector: "Industrials" },
  { symbol: "FAST", sector: "Industrials" },
  { symbol: "ODFL", sector: "Industrials" },
  { symbol: "PAYX", sector: "Industrials" },
  { symbol: "PCAR", sector: "Industrials" },
  { symbol: "CTAS", sector: "Industrials" },
  { symbol: "VRSK", sector: "Industrials" },
  { symbol: "CPRT", sector: "Industrials" },
  { symbol: "ADP", sector: "Industrials" },
  { symbol: "AXON", sector: "Industrials" },

  // Energy
  { symbol: "FANG", sector: "Energy" },
  { symbol: "BKR", sector: "Energy" },

  // Utilities
  { symbol: "CEG", sector: "Utilities" },
  { symbol: "XEL", sector: "Utilities" },
  { symbol: "EXC", sector: "Utilities" },
  { symbol: "AEP", sector: "Utilities" },

  // Financials
  { symbol: "PYPL", sector: "Financials" },

  // Materials
  { symbol: "LIN", sector: "Materials" },

  // Real Estate
  { symbol: "CSGP", sector: "Real Estate" },
] as const;

export const NASDAQ_100_SYMBOLS: readonly string[] = NASDAQ_100.map(
  (e) => e.symbol,
);

export const N100_SECTOR_BY_SYMBOL: Record<string, BroadSector> =
  Object.fromEntries(NASDAQ_100.map((e) => [e.symbol, e.sector]));
