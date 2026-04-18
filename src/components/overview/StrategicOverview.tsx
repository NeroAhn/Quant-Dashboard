"use client";

import { ExecutiveSummary } from "./ExecutiveSummary";
import { MarketCards } from "./MarketCards";
import { ThresholdWarnings } from "./ThresholdWarnings";
import { NumericalChecklist } from "./NumericalChecklist";
import { SidePanel } from "./SidePanel";
import { StrategicTimeline } from "./StrategicTimeline";

export function StrategicOverview() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Executive Summary -- dynamic AI-generated via Gemini */}
        <ExecutiveSummary />

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
