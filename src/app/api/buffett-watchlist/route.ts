import { NextResponse } from "next/server";
import { getCachedWatchlistBuffett } from "@/lib/buffett/watchlist-cache";

export const maxDuration = 60;

export async function GET() {
  try {
    const bundle = await getCachedWatchlistBuffett();
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[/api/buffett-watchlist] failure:", error);
    return NextResponse.json(
      { error: "Failed to load watchlist buffett metrics" },
      { status: 500 },
    );
  }
}
