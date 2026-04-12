"use client";

import { BarChart3 } from "lucide-react";
import { MarketCards } from "./MarketCards";
import { ThresholdWarnings } from "./ThresholdWarnings";
import { NumericalChecklist } from "./NumericalChecklist";
import { SidePanel } from "./SidePanel";
import { StrategicTimeline } from "./StrategicTimeline";

export function StrategicOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Executive Summary -- static placeholder per D-03 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
            <BarChart3 className="text-brand-accent-blue" size={20} />
            3-Line Executive Summary
          </h2>
          <div className="space-y-3 text-slate-700 leading-relaxed border-l-4 border-brand-accent-blue pl-4 font-medium">
            <p>1. [Macro] 금리 상회 속 비트코인과 금의 동반 강세는 법정화폐 가치 하락에 대한 헷지 수요와 지정학적 불안감을 동시에 반영 중.</p>
            <p>2. [Quant] 주도주의 RS는 여전히 110 이상이나, 이격도(MA50)가 10%를 상회하며 &apos;추격 매수&apos;의 위험 보상 비율이 낮아짐.</p>
            <p>3. [Market Implication] 지수 하락 압력 시 Revision UP 종목 위주로 방어적 포트폴리오 재편, 현금 비중 15~20% 유지 권장.</p>
          </div>
        </div>

        {/* Market Snapshot Cards -- dynamic from useMarketData */}
        <MarketCards />

        {/* Macro Threshold Warnings -- dynamic from useMarketData */}
        <ThresholdWarnings />

        {/* Numerical Checklist -- dynamic from useWatchlist */}
        <NumericalChecklist />
      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        <SidePanel />
        <StrategicTimeline />
      </div>
    </div>
  );
}
