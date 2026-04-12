"use client";

import { useDashboardStore } from "@/store/dashboard";
import { useWatchlist } from "@/hooks/use-watchlist";
import { MetricGuide } from "@/components/layout/MetricGuide";
import { Header } from "@/components/layout/Header";
import { TabNavigation } from "@/components/layout/TabNavigation";
import { StrategicOverview } from "@/components/overview/StrategicOverview";
import { WatchlistTab } from "@/components/tables/WatchlistTab";
import { MonitoringTab } from "@/components/tables/MonitoringTab";

export default function Home() {
  const { activeTab } = useDashboardStore();
  const watchlist = useWatchlist();

  const lastUpdated = watchlist.dataUpdatedAt
    ? new Date(watchlist.dataUpdatedAt).toLocaleString("ko-KR")
    : "로딩 중...";

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary font-sans p-4 md:p-8">
      {/* Alpha Watchlist Manual -- always visible per DSGN-03 */}
      <MetricGuide />

      {/* Header + Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Header lastUpdated={lastUpdated} />
        <TabNavigation />
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {activeTab === "overview" && <StrategicOverview />}
        {activeTab === "watchlist" && <WatchlistTab />}
        {activeTab === "monitoring" && <MonitoringTab />}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-[10px] uppercase tracking-widest">
        Proprietary Analysis Framework | 18Y Senior Quant Strategy Engine | Market Intelligence Unit
      </div>
    </div>
  );
}
