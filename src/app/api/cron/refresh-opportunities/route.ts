import { NextResponse } from "next/server";
import {
  getCachedOpportunities,
  invalidateOpportunityCache,
} from "@/lib/opportunities/cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    invalidateOpportunityCache();
    const bundle = await getCachedOpportunities();
    return NextResponse.json({
      ok: true,
      generatedAt: bundle.generatedAt,
      count: bundle.opportunities.length,
      eligibleCount: bundle.eligibleCount,
    });
  } catch (error) {
    console.error("[cron/refresh-opportunities] failure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh" },
      { status: 500 },
    );
  }
}
