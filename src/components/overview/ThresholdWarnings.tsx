"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { useMarketData } from "@/hooks/use-market-data";
import { MACRO_THRESHOLDS } from "@/lib/constants";

interface ThresholdStatus {
  name: string;
  threshold: string;
  currentValue: string | null;
  breached: boolean;
  comment: string;
  direction: "above" | "below";
}

function getThresholdStatuses(marketData: {
  data: { symbol: string; price: number | null }[];
  fearGreed: { score: number } | null;
} | undefined): ThresholdStatus[] {
  const yieldItem = marketData?.data.find((d) => d.symbol === "^TNX");
  const dxyItem = marketData?.data.find((d) => d.symbol === "DX-Y.NYB");
  const fearScore = marketData?.fearGreed?.score ?? null;

  return [
    {
      name: "10Y Yield",
      threshold: `${MACRO_THRESHOLDS.YIELD_10Y_WARNING}%`,
      currentValue: yieldItem?.price != null ? `${yieldItem.price.toFixed(2)}%` : null,
      breached: yieldItem?.price != null && yieldItem.price >= MACRO_THRESHOLDS.YIELD_10Y_WARNING,
      comment: "돌파 시 기술주 밸류에이션 강력한 하방 압력. 현금 비중 확대 필요.",
      direction: "above",
    },
    {
      name: "DXY Index",
      threshold: `${MACRO_THRESHOLDS.DXY_WARNING}`,
      currentValue: dxyItem?.price != null ? `${dxyItem.price.toFixed(2)}` : null,
      breached: dxyItem?.price != null && dxyItem.price >= MACRO_THRESHOLDS.DXY_WARNING,
      comment: "돌파 시 다국적 기업 이익 훼손 및 위험자산 이탈 가속화 경계.",
      direction: "above",
    },
    {
      name: "Fear Index",
      threshold: `${MACRO_THRESHOLDS.FEAR_GREED_WARNING} 이하`,
      currentValue: fearScore != null ? `${fearScore}` : null,
      breached: fearScore != null && fearScore <= MACRO_THRESHOLDS.FEAR_GREED_WARNING,
      comment: "극도의 공포 구간. 펀더멘털 우량주의 패닉 셀링 시 역발상 매수 검토.",
      direction: "below",
    },
  ];
}

export function ThresholdWarnings() {
  const marketData = useMarketData();
  const statuses = getThresholdStatuses(marketData.data);

  const anyBreached = statuses.some((s) => s.breached);

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${
      anyBreached
        ? "bg-red-50 border-red-200"
        : "bg-amber-50 border-amber-100"
    }`}>
      <h2 className={`text-sm font-bold mb-4 flex items-center gap-2 ${
        anyBreached ? "text-red-800" : "text-amber-800"
      }`}>
        {anyBreached ? <AlertTriangle size={18} /> : <AlertCircle size={18} />}
        Macro Threshold Warnings (전략적 경계 구간)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((s) => (
          <div key={s.name} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold ${s.breached ? "text-red-700" : "text-amber-700"}`}>
                {s.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                s.breached
                  ? "bg-red-200 text-red-800"
                  : "bg-amber-200 text-amber-800"
              }`}>
                {s.threshold}
              </span>
            </div>
            {/* D-11: Show live API value with threshold comparison */}
            {s.currentValue != null && (
              <p className={`text-[11px] font-bold ${
                s.breached ? "text-red-700" : "text-amber-700"
              }`}>
                현재 {s.name}: {s.currentValue}
                {s.breached
                  ? ` (임계치 ${s.threshold} 돌파)`
                  : ` (임계치: ${s.threshold})`
                }
              </p>
            )}
            <p className={`text-xs leading-snug ${
              s.breached ? "text-red-900/80" : "text-amber-900/80"
            }`}>
              {s.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
