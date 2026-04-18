import { NextResponse } from "next/server";
import { getOrRefreshSummary } from "@/lib/gemini/cache";
import type { ExecutiveSummaryResult } from "@/lib/gemini/cache";

/**
 * GET /api/executive-summary
 * Gemini 2.5 Flash 기반 3-Line Executive Summary 반환.
 * D-03: 30분 서버 캐시. D-04: 실패 시 마지막 성공 응답 반환.
 * T-03-03: 클라이언트에 generic 에러만 반환, 상세 로그는 서버 측.
 */
export async function GET(): Promise<
  NextResponse<ExecutiveSummaryResult | { error: string }>
> {
  try {
    const result = await getOrRefreshSummary();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[/api/executive-summary] failure:", error);
    return NextResponse.json(
      { error: "Failed to generate executive summary" },
      { status: 500 }
    );
  }
}
