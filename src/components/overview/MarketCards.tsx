"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMarketData } from "@/hooks/use-market-data";
import { MarketCardSkeleton } from "@/components/skeleton";
import { MACRO_THRESHOLDS } from "@/lib/constants";
import type { MarketDataItem } from "@/types/dashboard";

function isThresholdBreached(symbol: string, price: number | null): boolean {
  if (price == null) return false;
  if (symbol === "^TNX") return price >= MACRO_THRESHOLDS.YIELD_10Y_WARNING;
  if (symbol === "DX-Y.NYB") return price >= MACRO_THRESHOLDS.DXY_WARNING;
  return false;
}

function isFearBreached(score: number | null): boolean {
  if (score == null) return false;
  return score <= MACRO_THRESHOLDS.FEAR_GREED_WARNING;
}

function MarketCard({ item, breached }: { item: MarketDataItem; breached: boolean }) {
  return (
    <div className={`p-4 rounded-xl border shadow-sm ${
      breached
        ? "border-amber-400 bg-amber-50"
        : "border-slate-200 bg-white"
    }`}>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        {item.name}
      </p>
      <div className="flex items-end justify-between mt-1">
        <span className="text-lg font-bold text-slate-900">
          {item.price ?? "N/A"}
        </span>
        <span className={`text-xs font-bold flex items-center ${
          item.changePercent != null && item.changePercent >= 0
            ? "text-green-600"
            : "text-red-600"
        }`}>
          {item.changePercent != null && item.changePercent >= 0 ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {item.changePercent != null
            ? `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
            : "N/A"}
        </span>
      </div>
    </div>
  );
}

export function MarketCards() {
  const marketData = useMarketData();

  if (marketData.isPending) return <MarketCardSkeleton />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {marketData.data?.data.map((item) => (
        <MarketCard
          key={item.symbol}
          item={item}
          breached={isThresholdBreached(item.symbol, item.price)}
        />
      ))}
      {marketData.data?.fearGreed && (
        <div className={`p-4 rounded-xl border shadow-sm ${
          isFearBreached(marketData.data.fearGreed.score)
            ? "border-amber-400 bg-amber-50"
            : "border-slate-200 bg-white"
        }`}>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Fear & Greed
          </p>
          <div className="flex items-end justify-between mt-1">
            <span className="text-lg font-bold text-slate-900">
              {marketData.data.fearGreed.score}
            </span>
            <span className="text-xs font-bold text-amber-600">
              {marketData.data.fearGreed.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
