"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useDashboardStore } from "@/store/dashboard";

type SortField = "rs" | "drawdown" | "ma50Dist" | "symbol";

interface SortHeaderProps {
  field: SortField;
  label: string;
  className?: string;
}

export function SortHeader({ field, label, className = "" }: SortHeaderProps) {
  const { sortConfig, setSortConfig } = useDashboardStore();
  const isActive = sortConfig.field === field;

  return (
    <th
      className={`px-6 py-4 cursor-pointer select-none hover:bg-slate-200 transition-colors ${className}`}
      onClick={() => setSortConfig(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp size={12} />
          ) : (
            <ArrowDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="text-slate-300" />
        )}
      </span>
    </th>
  );
}
