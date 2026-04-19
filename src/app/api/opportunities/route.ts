import { NextResponse } from "next/server";
import { getCachedOpportunities } from "@/lib/opportunities/cache";

export const maxDuration = 60;

export async function GET() {
  try {
    const bundle = await getCachedOpportunities();
    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[/api/opportunities] failure:", error);
    return NextResponse.json(
      { error: "Failed to load opportunities" },
      { status: 500 },
    );
  }
}
