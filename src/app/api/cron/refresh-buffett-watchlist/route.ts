import { NextResponse } from "next/server";
import {
  getCachedWatchlistBuffett,
  invalidateWatchlistBuffettCache,
} from "@/lib/buffett/watchlist-cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    invalidateWatchlistBuffettCache();
    const bundle = await getCachedWatchlistBuffett();
    return NextResponse.json({
      ok: true,
      generatedAt: bundle.generatedAt,
      count: Object.keys(bundle.metrics).length,
    });
  } catch (error) {
    console.error("[cron/refresh-buffett-watchlist] failure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh" },
      { status: 500 },
    );
  }
}
