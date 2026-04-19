import { unstable_cache, revalidateTag } from "next/cache";
import {
  generateOpportunities,
  type OpportunityBundle,
} from "./generator";

const CACHE_TAG = "opportunities";
const TWENTY_FOUR_HOURS_SECONDS = 24 * 60 * 60;

const EMPTY_BUNDLE: OpportunityBundle = {
  opportunities: [],
  generatedAt: "",
  universeSize: 0,
  eligibleCount: 0,
};

let lastSuccessfulBundle: OpportunityBundle | null = null;

async function generateWithFallback(): Promise<OpportunityBundle> {
  try {
    const fresh = await generateOpportunities();
    lastSuccessfulBundle = fresh;
    return fresh;
  } catch (error) {
    console.error("[opportunities] generation failed:", error);
    if (lastSuccessfulBundle) return lastSuccessfulBundle;
    return EMPTY_BUNDLE;
  }
}

export const getCachedOpportunities = unstable_cache(
  generateWithFallback,
  ["opportunities-v1"],
  {
    revalidate: TWENTY_FOUR_HOURS_SECONDS,
    tags: [CACHE_TAG],
  },
);

export function invalidateOpportunityCache(): void {
  revalidateTag(CACHE_TAG);
}
