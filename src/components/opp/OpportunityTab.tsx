"use client";

import { Sparkles } from "lucide-react";
import { useOpportunities } from "@/hooks/use-opportunities";
import { OpportunityTable } from "./OpportunityTable";

export function OpportunityTab() {
  const { data, error, isPending } = useOpportunities();

  const lastUpdated = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleString("ko-KR")
    : "-";

  const stats = data?.stats;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="text-brand-accent-blue" size={20} />
          Opp — Buffett Screener (NASDAQ-100)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          NASDAQ-100 중 바이오텍·밈 테마 제외 → 시총 ≥ $2B → 최근 3년 연속
          영업·순이익 플러스를 통과한 종목. 내재가치 대비 할인율(MoS) 순
          정렬. <span className="font-semibold text-amber-700">⭐ PICK</span>은
          MoS ≤ -30% + 4년 ROE ≥ 15% + Debt/NI &lt; 3y + RSI &lt; 30 네 가지를
          모두 만족한 종목입니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
          <span>
            Universe: <b>{stats?.universeSize ?? "-"}</b>
          </span>
          <span>
            제외(산업): <b>{stats?.excludedByIndustry ?? "-"}</b>
          </span>
          <span>
            fetch 실패: <b>{stats?.failedFetch ?? "-"}</b>
          </span>
          <span>
            시총 미달: <b>{stats?.failedMarketCap ?? "-"}</b>
          </span>
          <span>
            3년 흑자 미달: <b>{stats?.failedIncome ?? "-"}</b>
          </span>
          <span>
            통과: <b className="text-slate-700">{stats?.eligible ?? "-"}</b>
          </span>
          <span>
            ⭐ Pick: <b className="text-amber-700">{stats?.picks ?? 0}</b>
          </span>
          <span>Updated: {lastUpdated}</span>
        </div>
      </div>

      {error && (
        <p className="p-6 text-red-500 text-sm">Error: {error.message}</p>
      )}

      <OpportunityTable
        entries={data?.entries ?? []}
        isLoading={isPending}
      />
    </div>
  );
}
