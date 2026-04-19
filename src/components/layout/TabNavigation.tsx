"use client";
import { useDashboardStore } from "@/store/dashboard";

const TABS = [
  { key: "overview" as const, label: "전략 개요" },
  { key: "watchlist" as const, label: "워치리스트" },
  { key: "monitoring" as const, label: "모니터링 리스트" },
  { key: "opp" as const, label: "Opp" },
] as const;

export function TabNavigation() {
  const { activeTab, setActiveTab } = useDashboardStore();

  return (
    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setActiveTab(key)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === key
              ? "bg-brand-accent-blue text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
