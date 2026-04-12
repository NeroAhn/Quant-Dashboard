"use client";

import { MousePointer2 } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { TableSkeleton } from "@/components/skeleton";
import { ActionBadge } from "@/components/ui/ActionBadge";
import type { WatchlistItem } from "@/types/dashboard";

function isFullItem(
  item: { symbol: string; error?: string } | WatchlistItem
): item is WatchlistItem {
  return "price" in item;
}

export function NumericalChecklist() {
  const watchlist = useWatchlist();
  const items = (watchlist.data?.data ?? []).filter(isFullItem);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-4">
        <MousePointer2 size={18} className="text-brand-accent-blue" />
        Numerical Checklist (종목별 조건부 대응)
      </h2>
      {watchlist.isPending && <TableSkeleton rows={6} />}
      {items.length > 0 && (
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="pb-3 font-semibold">종목</th>
                <th className="pb-3 font-semibold">조건 (Primary Condition)</th>
                <th className="pb-3 font-semibold">대응 (THEN Action)</th>
                <th className="pb-3 font-semibold">Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((t) => (
                <tr key={t.symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold">{t.symbol}</td>
                  <td className="py-3 text-[11px] text-slate-600">
                    {t.revision === "UP" ? "Revision UP & " : "Revision Weak & "}
                    {t.rs > 110 ? "Bullish RS" : "Lagging RS"}
                  </td>
                  <td className="py-3">
                    <ActionBadge action={t.action} />
                  </td>
                  <td className="py-3 text-[10px] text-slate-400 font-mono">
                    P/E {t.forwardPE != null ? `${t.forwardPE.toFixed(1)}x` : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
