"use client";

import { BarChart3, Clock } from "lucide-react";
import { useExecutiveSummary } from "@/hooks/use-executive-summary";

export function ExecutiveSummary() {
  const { data, error, isLoading } = useExecutiveSummary();

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
        <BarChart3 className="text-brand-accent-blue" size={20} />
        3-Line Executive Summary
        {data?.cached && (
          <span className="ml-auto flex items-center gap-1 text-xs font-normal text-slate-400">
            <Clock size={12} />
            cached
          </span>
        )}
      </h2>
      <div className="space-y-3 text-slate-700 leading-relaxed border-l-4 border-brand-accent-blue pl-4 font-medium">
        {isLoading && (
          <>
            <div className="animate-pulse bg-slate-200 h-5 rounded w-full" />
            <div className="animate-pulse bg-slate-200 h-5 rounded w-11/12" />
            <div className="animate-pulse bg-slate-200 h-5 rounded w-10/12" />
          </>
        )}
        {error && !data && (
          <p className="text-slate-400">
            AI Summary를 불러올 수 없습니다.
          </p>
        )}
        {data?.lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
}
