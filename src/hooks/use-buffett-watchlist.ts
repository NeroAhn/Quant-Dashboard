import { useQuery } from "@tanstack/react-query";
import type { BuffettMetrics } from "@/types/buffett";

export interface BuffettWatchlistResponse {
  metrics: Record<string, BuffettMetrics>;
  generatedAt: string;
}

export function useBuffettWatchlist() {
  return useQuery<BuffettWatchlistResponse>({
    queryKey: ["buffett-watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/buffett-watchlist");
      if (!res.ok)
        throw new Error(`Buffett watchlist fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 60 * 1000,
  });
}
