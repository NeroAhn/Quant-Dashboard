import { unstable_cache, revalidateTag } from "next/cache";
import {
  generateBuffettOpp,
  type BuffettOppBundle,
} from "./generator";

const CACHE_TAG = "buffett-opp";
const TWENTY_FOUR_HOURS = 24 * 60 * 60;

let lastSuccessfulBundle: BuffettOppBundle | null = null;

async function generateAndRemember(): Promise<BuffettOppBundle> {
  try {
    const fresh = await generateBuffettOpp();
    lastSuccessfulBundle = fresh;
    return fresh;
  } catch (error) {
    console.error("[buffett] generation failed:", error);
    if (lastSuccessfulBundle) return lastSuccessfulBundle;
    throw error;
  }
}

export const getCachedBuffettOpp = unstable_cache(
  generateAndRemember,
  ["buffett-opp-v2"],
  {
    revalidate: TWENTY_FOUR_HOURS,
    tags: [CACHE_TAG],
  },
);

export function invalidateBuffettOppCache(): void {
  revalidateTag(CACHE_TAG);
}
