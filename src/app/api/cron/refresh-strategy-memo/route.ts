import { NextResponse } from "next/server";
import {
  getCachedStrategyMemos,
  invalidateStrategyMemoCache,
} from "@/lib/strategy-memo/cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    invalidateStrategyMemoCache();
    const bundle = await getCachedStrategyMemos();
    return NextResponse.json({
      ok: true,
      generatedAt: bundle.generatedAt,
      count: Object.keys(bundle.memos).length,
    });
  } catch (error) {
    console.error("[cron/refresh-strategy-memo] failure:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh" },
      { status: 500 },
    );
  }
}
