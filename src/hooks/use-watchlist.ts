import { useQuery } from "@tanstack/react-query";
import type { WatchlistResponse } from "@/types/dashboard";

function getStockRefetchInterval(): number {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const hour = et.getHours();
  const minute = et.getMinutes();
  const day = et.getDay();

  // Weekend: 30min
  if (day === 0 || day === 6) return 30 * 60 * 1000;

  // Market hours (ET 9:30-16:00): 5min
  const marketOpen = hour > 9 || (hour === 9 && minute >= 30);
  const marketClose = hour < 16;
  if (marketOpen && marketClose) return 5 * 60 * 1000;

  // After hours: 30min
  return 30 * 60 * 1000;
}

export function useWatchlist() {
  return useQuery<WatchlistResponse>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const res = await fetch("/api/watchlist");
      if (!res.ok) throw new Error(`Watchlist fetch failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: getStockRefetchInterval,
    refetchIntervalInBackground: true,
    staleTime: 0, // D-11: stale data not retained
  });
}
