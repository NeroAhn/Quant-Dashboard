import { useQuery } from "@tanstack/react-query";

export interface StrategyMemoResponse {
  memos: Record<string, string>;
  generatedAt: string;
}

export function useStrategyMemo() {
  return useQuery<StrategyMemoResponse>({
    queryKey: ["strategy-memo"],
    queryFn: async () => {
      const res = await fetch("/api/strategy-memo");
      if (!res.ok)
        throw new Error(`Strategy memo fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 60 * 60 * 1000,
    refetchIntervalInBackground: false,
    staleTime: 30 * 60 * 1000,
  });
}
