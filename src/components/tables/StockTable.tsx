"use client";

import { useDashboardStore } from "@/store/dashboard";
import { TableSkeleton } from "@/components/skeleton";
import { ActionBadge } from "@/components/ui/ActionBadge";
import { RevisionBadge } from "@/components/ui/RevisionBadge";
import { SearchBar } from "@/components/ui/SearchBar";
import { SortHeader } from "@/components/ui/SortHeader";
import {
  getRsColor,
  getMa50Color,
  getDrawdownColor,
  getChangeColor,
} from "@/lib/colors";
import type { WatchlistItem, WatchlistResponse } from "@/types/dashboard";
import type { ReactNode } from "react";

function isFullItem(
  item: { symbol: string; error?: string } | WatchlistItem,
): item is WatchlistItem {
  return "price" in item;
}

interface StockTableProps {
  title: string;
  description: string;
  icon: ReactNode;
  isPending: boolean;
  error: Error | null;
  data: WatchlistResponse | undefined;
  defaultRows: number;
}

export function StockTable({
  title,
  description,
  icon,
  isPending,
  error,
  data,
  defaultRows,
}: StockTableProps) {
  const { searchQuery, sortConfig } = useDashboardStore();

  const items = (data?.data ?? []).filter(isFullItem);

  // Filter by search query (TAB2-05)
  const filtered = items.filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort (TAB2-04) -- handle string vs number fields
  const sorted = [...filtered].sort((a, b) => {
    const mul = sortConfig.direction === "asc" ? 1 : -1;
    const field = sortConfig.field;

    if (field === "symbol") {
      return a.symbol.localeCompare(b.symbol) * mul;
    }

    const aVal = a[field] as number;
    const bVal = b[field] as number;
    return (aVal - bVal) * mul;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header with title and search */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <SearchBar />
      </div>

      {/* Loading state */}
      {isPending && (
        <div className="p-6">
          <TableSkeleton rows={defaultRows} />
        </div>
      )}

      {/* Error state */}
      {error && <p className="p-6 text-red-500">Error: {error.message}</p>}

      {/* Desktop table view (hidden on mobile per D-06) */}
      {sorted.length > 0 && (
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold">
              <tr>
                <SortHeader field="symbol" label="종목" />
                <th className="px-6 py-4">가격 / 1D %</th>
                <SortHeader field="drawdown" label="고가 / 낙폭" />
                <SortHeader field="rs" label="RS (상대강도)" />
                <SortHeader field="ma50Dist" label="MA50 이격도" />
                <th className="px-6 py-4">Revision</th>
                <th className="px-6 py-4">FWD P/E</th>
                <th className="px-6 py-4">전략 메모</th>
                <th className="px-6 py-4">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((t) => (
                <tr
                  key={t.symbol}
                  className="hover:bg-slate-50 transition-colors text-xs"
                >
                  <td className="px-6 py-4 font-bold text-sm">{t.symbol}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold">${t.price}</span>
                      <span
                        className={`font-semibold ${getChangeColor(t.change1D)}`}
                      >
                        {t.change1D != null
                          ? `${t.change1D >= 0 ? "+" : ""}${t.change1D.toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 font-mono">
                        ${t.high52w ?? "N/A"}
                      </span>
                      <span
                        className={`font-bold ${getDrawdownColor(t.drawdown)}`}
                      >
                        {t.drawdown.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${getRsColor(t.rs)}`}>
                      {t.rs.toFixed(1)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 font-mono font-bold ${getMa50Color(t.ma50Dist)}`}
                  >
                    {t.ma50Dist >= 0 ? "+" : ""}
                    {t.ma50Dist.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4">
                    <RevisionBadge revision={t.revision} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {t.forwardPE != null ? `${t.forwardPE.toFixed(1)}x` : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-[10px]">-</td>
                  <td className="px-6 py-4">
                    <ActionBadge action={t.action} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile card view (hidden on desktop per D-06) */}
      {sorted.length > 0 && (
        <div className="md:hidden space-y-3 p-4">
          {sorted.map((t) => (
            <div
              key={t.symbol}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm"
            >
              {/* Header row: Symbol + Action badge */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{t.symbol}</span>
                <ActionBadge action={t.action} />
              </div>
              {/* Primary metrics: 2-column grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">가격</span>
                  <span className="font-mono font-bold">${t.price}</span>
                  <span
                    className={`ml-1 font-semibold ${getChangeColor(t.change1D)}`}
                  >
                    {t.change1D != null
                      ? `${t.change1D >= 0 ? "+" : ""}${t.change1D.toFixed(2)}%`
                      : ""}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">RS</span>
                  <span className={`font-bold ${getRsColor(t.rs)}`}>
                    {t.rs.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">낙폭</span>
                  <span
                    className={`font-bold ${getDrawdownColor(t.drawdown)}`}
                  >
                    {t.drawdown.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">MA50 이격도</span>
                  <span
                    className={`font-mono font-bold ${getMa50Color(t.ma50Dist)}`}
                  >
                    {t.ma50Dist >= 0 ? "+" : ""}
                    {t.ma50Dist.toFixed(2)}%
                  </span>
                </div>
              </div>
              {/* Secondary metrics row */}
              <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <RevisionBadge revision={t.revision} />
                <span>
                  P/E{" "}
                  {t.forwardPE != null ? `${t.forwardPE.toFixed(1)}x` : "N/A"}
                </span>
                <span>고가 ${t.high52w ?? "N/A"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state after filtering */}
      {!isPending && !error && sorted.length === 0 && items.length > 0 && (
        <div className="p-6 text-center text-slate-400 text-sm">
          &quot;{searchQuery}&quot;에 해당하는 종목이 없습니다.
        </div>
      )}
    </div>
  );
}
