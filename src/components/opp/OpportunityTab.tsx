"use client";

import { Sparkles } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { OpportunityTable } from "./OpportunityTable";

export function OpportunityTab() {
  const { data, error, isPending } = useOpportunities();

  const lastUpdated = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString("ko-KR")
    : "-";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-brand-accent-blue" size={20} />
          Opportunity Screener
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          NASDAQ 상장 중 낙폭·저P/E 기반 상위 30개 (섹터당 최대 5개).
          Drawdown ≤ -20% · 0 &lt; FWD P/E &lt; 50 · Market Cap ≥ $2B
        </p>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-500">
          <span>
            Universe: <b>{data?.universeSize ?? "-"}</b>
          </span>
          <span>
            Eligible: <b>{data?.eligibleCount ?? "-"}</b>
          </span>
          <span>Updated: {lastUpdated}</span>
        </div>
      </div>

      {error && (
        <p className="p-6 text-red-500 text-sm">Error: {error.message}</p>
      )}

      <OpportunityTable
        opportunities={data?.opportunities ?? []}
        isLoading={isPending}
      />
    </div>
  );
}
