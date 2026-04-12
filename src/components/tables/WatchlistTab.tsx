"use client";

import { Activity } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { StockTable } from "./StockTable";

export function WatchlistTab() {
  const watchlist = useWatchlist();

  return (
    <StockTable
      title="워치리스트 (Primary Matrix)"
      description="12 Priority Tickers | Fundamental + Technical + Sentiment"
      icon={<Activity className="text-brand-accent-blue" size={24} />}
      isPending={watchlist.isPending}
      error={watchlist.error}
      data={watchlist.data}
      defaultRows={12}
    />
  );
}
