import { useQuery } from "@tanstack/react-query";
import type { MarketDataResponse } from "@/types/dashboard";

export function useMarketData() {
  return useQuery<MarketDataResponse>({
    queryKey: ["market-data"],
    queryFn: async () => {
      const res = await fetch("/api/market-data");
      if (!res.ok) throw new Error(`Market data fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // D-12: BTC/Gold/DXY are 24h assets, always 5min
    refetchIntervalInBackground: true,
    staleTime: 0, // D-11: stale data not retained
  });
}
