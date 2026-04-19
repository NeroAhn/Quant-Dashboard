import { useQuery } from "@tanstack/react-query";
import type { OpportunityEntry } from "@/lib/opportunities/generator";

export interface OpportunitiesResponse {
  opportunities: OpportunityEntry[];
  generatedAt: string;
  universeSize: number;
  eligibleCount: number;
}

export function useOpportunities() {
  return useQuery<OpportunitiesResponse>({
    queryKey: ["opportunities"],
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
