import { unstable_cache, revalidateTag } from "next/cache";
import {
  generateOpportunities,
  type OpportunityBundle,
} from "./generator";

const CACHE_TAG = "opportunities";
const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;

let lastSuccessfulBundle: OpportunityBundle | null = null;

async function generateAndRemember(): Promise<OpportunityBundle> {
  try {
    const fresh = await generateOpportunities();
    lastSuccessfulBundle = fresh;
    return fresh;
  } catch (error) {
    console.error("[opportunities] generation failed:", error);
    if (lastSuccessfulBundle) return lastSuccessfulBundle;
    // Rethrow so Next.js does not cache the failure.
    throw error;
  }
}

export const getCachedOpportunities = unstable_cache(
  generateAndRemember,
  ["opportunities-v2"],
  {
    revalidate: TWENTY_FOUR_HOURS_SECONDS,
    tags: [CACHE_TAG],
  },
);

export function invalidateOpportunityCache(): void {
  revalidateTag(CACHE_TAG);
}
