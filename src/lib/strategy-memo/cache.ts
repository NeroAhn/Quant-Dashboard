import { unstable_cache, revalidateTag } from "next/cache";
import { generateStrategyMemos, type StrategyMemoBundle } from "./generator";

const CACHE_TAG = "strategy-memos";
const TWELVE_HOURS_SECONDS = 12 * 60 * 60;

const EMPTY_BUNDLE: StrategyMemoBundle = { memos: {}, generatedAt: "" };

let lastSuccessfulBundle: StrategyMemoBundle | null = null;

async function generateWithFallback(): Promise<StrategyMemoBundle> {
  try {
    const fresh = await generateStrategyMemos();
    lastSuccessfulBundle = fresh;
    return fresh;
  } catch (error) {
    console.error("[strategy-memo] generation failed:", error);
    if (lastSuccessfulBundle) return lastSuccessfulBundle;
    return EMPTY_BUNDLE;
  }
}

export const getCachedStrategyMemos = unstable_cache(
  generateWithFallback,
  ["strategy-memos-v1"],
  {
    revalidate: TWELVE_HOURS_SECONDS,
    tags: [CACHE_TAG],
  },
);

export function invalidateStrategyMemoCache(): void {
  revalidateTag(CACHE_TAG);
}
