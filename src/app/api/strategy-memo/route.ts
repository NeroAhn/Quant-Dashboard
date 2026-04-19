import { NextResponse } from "next/server";
import { getCachedStrategyMemos } from "@/lib/strategy-memo/cache";

export async function GET() {
  try {
    const bundle = await getCachedStrategyMemos();
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[/api/strategy-memo] failure:", error);
    return NextResponse.json(
      { error: "Failed to load strategy memos" },
      { status: 500 },
    );
  }
}
