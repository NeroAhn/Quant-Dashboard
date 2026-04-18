import { useQuery } from "@tanstack/react-query";

interface ExecutiveSummaryResponse {
  lines: string[];
  generatedAt: string;
  cached: boolean;
}

export function useExecutiveSummary() {
  return useQuery<ExecutiveSummaryResponse>({
    queryKey: ["executive-summary"],
    queryFn: async () => {
      const res = await fetch("/api/executive-summary");
      if (!res.ok)
        throw new Error(`Executive summary fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 30 * 60 * 1000, // 30 minutes per D-03
    refetchIntervalInBackground: true,
    staleTime: 25 * 60 * 1000, // Consider stale at 25 min to trigger background refresh
  });
}
