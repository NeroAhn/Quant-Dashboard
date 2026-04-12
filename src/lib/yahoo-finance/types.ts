// yahoo-finance2의 quote() 응답에서 사용하는 필드 서브셋
export interface YFQuoteResult {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  fiftyTwoWeekHigh?: number;
  fiftyDayAverage?: number;
  forwardPE?: number;
}
