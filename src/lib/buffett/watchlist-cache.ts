import { unstable_cache, revalidateTag } from "next/cache";
import {
  generateWatchlistBuffett,
  type WatchlistBuffettBundle,
} from "./watchlist-enrichment";

const CACHE_TAG = "buffett-watchlist";
const TWENTY_FOUR_HOURS = 24 * 60 * 60;

let lastSuccessful: WatchlistBuffettBundle | null = null;

async function generateAndRemember(): Promise<WatchlistBuffettBundle> {
  try {
    const fresh = await generateWatchlistBuffett();
    lastSuccessful = fresh;
    return fresh;
  } catch (error) {
    console.error("[buffett-watchlist] generation failed:", error);
    if (lastSuccessful) return lastSuccessful;
    throw error;
  }
}

export const getCachedWatchlistBuffett = unstable_cache(
  generateAndRemember,
  ["buffett-watchlist-v2"],
  {
    revalidate: TWENTY_FOUR_HOURS,
    tags: [CACHE_TAG],
  },
);

export function invalidateWatchlistBuffettCache(): void {
  revalidateTag(CACHE_TAG);
}
