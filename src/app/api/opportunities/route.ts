import { NextResponse } from "next/server";
import { getCachedOpportunities } from "@/lib/opportunities/cache";

export const maxDuration = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";
  try {
    const bundle = await getCachedOpportunities();
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[/api/opportunities] failure:", error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      debug
        ? { error: "Failed to load opportunities", message, stack }
        : { error: "Failed to load opportunities" },
      { status: 500 },
    );
  }
}
