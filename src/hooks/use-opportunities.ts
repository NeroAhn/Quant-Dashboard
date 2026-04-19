import { useQuery } from "@tanstack/react-query";
import type { BuffettMetrics } from "@/types/buffett";

export interface OpportunitiesResponse {
  entries: BuffettMetrics[];
  generatedAt: string;
  stats: {
    universeSize: number;
    excludedByIndustry: number;
    failedFetch: number;
    failedMarketCap: number;
    failedIncome: number;
    eligible: number;
    picks: number;
  };
}

export function useOpportunities() {
  return useQuery<OpportunitiesResponse>({
    queryKey: ["opportunities-buffett"],
    queryFn: async () => {
      const res = await fetch("/api/opportunities");
      if (!res.ok)
        throw new Error(`Opportunities fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 60 * 1000,
  });
}
