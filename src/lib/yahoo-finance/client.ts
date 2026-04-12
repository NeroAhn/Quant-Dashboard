import YahooFinance from "yahoo-finance2";

// yahoo-finance2 v3: instantiate client with validation warnings suppressed
const yahooFinance = new YahooFinance({ validation: { logErrors: false } });

export default yahooFinance;
