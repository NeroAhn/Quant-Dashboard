import { NextResponse } from "next/server";
import yahooFinance from "@/lib/yahoo-finance/client";

export const maxDuration = 30;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") ?? "AAPL";

  try {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "incomeStatementHistory",
        "balanceSheetHistory",
        "cashflowStatementHistory",
        "earningsTrend",
        "defaultKeyStatistics",
        "financialData",
      ],
    });

    return NextResponse.json({
      symbol,
      incomeStatementHistoryKeys: summary.incomeStatementHistory
        ? Object.keys(summary.incomeStatementHistory)
        : null,
      incomeStatementsSample:
        summary.incomeStatementHistory?.incomeStatementHistory?.[0] ?? null,
      incomeStatementsLength:
        summary.incomeStatementHistory?.incomeStatementHistory?.length ?? 0,
      balanceSampleKeys: summary.balanceSheetHistory?.balanceSheetStatements?.[0]
        ? Object.keys(summary.balanceSheetHistory.balanceSheetStatements[0])
        : null,
      cashflowSampleKeys: summary.cashflowStatementHistory?.cashflowStatements?.[0]
        ? Object.keys(summary.cashflowStatementHistory.cashflowStatements[0])
        : null,
      cashflowSample:
        summary.cashflowStatementHistory?.cashflowStatements?.[0] ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
