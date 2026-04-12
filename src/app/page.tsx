"use client";

import { useState } from "react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useMonitoring } from "@/hooks/use-monitoring";
import { useMarketData } from "@/hooks/use-market-data";
import { MarketCardSkeleton, TableSkeleton } from "@/components/skeleton";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  BarChart3,
  Activity,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BookOpen,
  Layers,
  MousePointer2,
} from "lucide-react";
import type { WatchlistItem } from "@/types/dashboard";

type Tab = "overview" | "watchlist" | "monitoring";

const ACTION_COLORS: Record<string, string> = {
  Buy: "bg-green-100 text-green-700",
  Trim: "bg-orange-100 text-orange-700",
  Wait: "bg-red-100 text-red-700",
  Hold: "bg-slate-100 text-slate-600",
};

const REVISION_COLORS: Record<string, string> = {
  UP: "bg-green-100 text-green-700",
  DOWN: "bg-red-100 text-red-700",
  NEUTRAL: "bg-slate-100 text-slate-500",
};

// Static data for sections not yet backed by API
const thresholds = [
  {
    name: "10Y Yield",
    level: "4.5%",
    comment:
      "돌파 시 기술주 밸류에이션 강력한 하방 압력. 현금 비중 확대 필요.",
  },
  {
    name: "DXY Index",
    level: "106.0",
    comment:
      "돌파 시 다국적 기업 이익 훼손 및 위험자산 이탈 가속화 경계.",
  },
  {
    name: "Fear Index",
    level: "30 이하",
    comment:
      "극도의 공포 구간. 펀더멘털 우량주의 패닉 셀링 시 역발상 매수 검토.",
  },
];

const risks = [
  {
    title: "지정학적 에너지 쇼크",
    desc: "WTI $100 돌파 시 스태그플레이션 리스크 상존",
  },
  {
    title: "금리 De-rating",
    desc: "10Y 금리 4.5% 도달 시 기술주 멀티플 축소 압력",
  },
];

const opportunities = [
  {
    title: "AI 수익화 가시성",
    desc: "빅테크 실적 발표 시 AI CAPEX 대비 매출 증명 기대",
  },
  {
    title: "금리 동결 사이클",
    desc: "PCE 하향 안정화 확인 시 연말 금리 인하 기대감 재부각",
  },
];

const timeline = [
  { date: "Apr 14", event: "U.S. CPI Release", impact: "H" },
  { date: "Apr 23", event: "Tech Earnings Peak", impact: "H" },
  { date: "May 01", event: "FOMC Meeting", impact: "M" },
];

function isFullItem(
  item: { symbol: string; error?: string } | WatchlistItem
): item is WatchlistItem {
  return "price" in item;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const watchlist = useWatchlist();
  const monitoring = useMonitoring();
  const marketData = useMarketData();

  const lastUpdated = watchlist.dataUpdatedAt
    ? new Date(watchlist.dataUpdatedAt).toLocaleString("ko-KR")
    : "Loading...";

  const watchlistItems = (watchlist.data?.data ?? []).filter(isFullItem);
  const monitoringItems = (monitoring.data?.data ?? []).filter(isFullItem);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Metric Guide */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <h2 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} />
            지표 해석 및 전략 가이드 (Alpha Watchlist Manual)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">
                RS (Relative Strength)
              </p>
              <p className="text-sm text-slate-700 leading-tight font-medium">
                100 기준. 110&uarr; 주도주, 90&darr; 소외주. 강한 놈이 더 가는
                &apos;관성&apos;을 측정.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">
                MA 50 Dist (이격도)
              </p>
              <p className="text-sm text-slate-700 leading-tight font-medium">
                추세 대비 가격 위치. +15%&uarr; 단기 과열, -5%~-10%는 매력적인
                눌림목.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Revision (이익 수정)
              </p>
              <p className="text-sm text-slate-700 leading-tight font-medium">
                애널리스트 전망 변화. UP은 펀더멘털 개선 신호, DOWN은 위험 신호.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">
                Drawdown (낙폭)
              </p>
              <p className="text-sm text-slate-700 leading-tight font-medium">
                고점 대비 하락률. Revision UP과 결합 시 최고의 저가 매수 지표.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header & Tabs */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="text-blue-600" />
            Quant Strategist Pro Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            18Y Senior Macro Strategy Framework | {lastUpdated}
          </p>
        </div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-slate-200">
          {(
            [
              ["overview", "Strategic Overview"],
              ["watchlist", "Watchlist"],
              ["monitoring", "Monitoring List"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tab 1: Strategic Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Executive Summary */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                  <BarChart3 className="text-blue-600" size={20} />
                  3-Line Executive Summary
                </h2>
                <div className="space-y-3 text-slate-700 leading-relaxed border-l-4 border-blue-500 pl-4 font-medium">
                  <p>
                    1. [Macro] 금리 상회 속 비트코인과 금의 동반 강세는 법정화폐
                    가치 하락에 대한 헷지 수요와 지정학적 불안감을 동시에 반영 중.
                  </p>
                  <p>
                    2. [Quant] 주도주의 RS는 여전히 110 이상이나, 이격도(MA50)가
                    10%를 상회하며 &apos;추격 매수&apos;의 위험 보상 비율이 낮아짐.
                  </p>
                  <p>
                    3. [Market Implication] 지수 하락 압력 시 Revision UP 종목
                    위주로 방어적 포트폴리오 재편, 현금 비중 15~20% 유지 권장.
                  </p>
                </div>
              </div>

              {/* Market Indices Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketData.isPending && <MarketCardSkeleton />}
                {marketData.data?.data.map((item) => (
                  <div
                    key={item.symbol}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                  >
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {item.name}
                    </p>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-lg font-bold text-slate-900">
                        {item.price ?? "N/A"}
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center ${
                          item.changePercent != null && item.changePercent >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.changePercent != null && item.changePercent >= 0 ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                        {item.changePercent != null
                          ? `${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toFixed(2)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                ))}
                {marketData.data?.fearGreed && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Fear & Greed
                    </p>
                    <div className="flex items-end justify-between mt-1">
                      <span className="text-lg font-bold text-slate-900">
                        {marketData.data.fearGreed.score}
                      </span>
                      <span className="text-xs font-bold text-amber-600">
                        {marketData.data.fearGreed.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Threshold Warnings */}
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 shadow-sm">
                <h2 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Macro Threshold Warnings (전략적 경계 구간)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {thresholds.map((t) => (
                    <div key={t.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-700">
                          {t.name}
                        </span>
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded font-bold">
                          {t.level}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/80 leading-snug">
                        {t.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numerical Checklist */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800 mb-4">
                  <MousePointer2 size={18} className="text-blue-500" />
                  Numerical Checklist (종목별 조건부 대응)
                </h2>
                {watchlist.isPending && <TableSkeleton rows={6} />}
                {watchlistItems.length > 0 && (
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0 bg-white z-10 border-b border-slate-100 text-slate-500">
                        <tr>
                          <th className="pb-3 font-semibold">Ticker</th>
                          <th className="pb-3 font-semibold">
                            조건 (Primary Condition)
                          </th>
                          <th className="pb-3 font-semibold">
                            대응 (THEN Action)
                          </th>
                          <th className="pb-3 font-semibold">Valuation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {watchlistItems.map((t) => (
                          <tr
                            key={t.symbol}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 font-bold">{t.symbol}</td>
                            <td className="py-3 text-[11px] text-slate-600">
                              {t.revision === "UP"
                                ? "Revision UP & "
                                : "Revision Weak & "}
                              {t.rs > 110 ? "Bullish RS" : "Lagging RS"}
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-[10px] px-2 py-1 rounded font-bold ${
                                  ACTION_COLORS[t.action] ?? ACTION_COLORS.Hold
                                }`}
                              >
                                {t.action}
                              </span>
                            </td>
                            <td className="py-3 text-[10px] text-slate-400 font-mono">
                              P/E{" "}
                              {t.forwardPE != null
                                ? `${t.forwardPE.toFixed(1)}x`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Risks & Opportunities */}
              <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <ShieldAlert className="text-amber-400" size={20} />
                  Market Opportunities & Risks
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingUp size={12} /> Opportunities
                    </h3>
                    <div className="space-y-3">
                      {opportunities.map((o) => (
                        <div
                          key={o.title}
                          className="p-3 bg-green-950/20 border border-green-900/30 rounded-lg"
                        >
                          <p className="text-sm font-bold">{o.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {o.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <TrendingDown size={12} /> Risks
                    </h3>
                    <div className="space-y-3">
                      {risks.map((r) => (
                        <div
                          key={r.title}
                          className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg"
                        >
                          <p className="text-sm font-bold">{r.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {r.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Timeline */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-blue-600" size={20} />
                  Strategic Timeline
                </h2>
                <div className="space-y-3">
                  {timeline.map((e) => (
                    <div
                      key={e.date}
                      className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border-l-2 border-blue-500"
                    >
                      <span className="font-bold">{e.date}</span>
                      <span className="text-slate-600 flex-1 ml-4 truncate">
                        {e.event}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {e.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Watchlist */}
        {activeTab === "watchlist" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="text-blue-600" size={24} />
                  Watchlist (Primary Matrix)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  12 Priority Tickers | Fundamental + Technical + Sentiment
                </p>
              </div>
            </div>
            {watchlist.isPending && (
              <div className="p-6">
                <TableSkeleton rows={12} />
              </div>
            )}
            {watchlist.error && (
              <p className="p-6 text-red-500">
                Error: {watchlist.error.message}
              </p>
            )}
            {watchlistItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Price / 1D %</th>
                      <th className="px-6 py-4">High / Drawdown</th>
                      <th className="px-6 py-4">Relative Strength</th>
                      <th className="px-6 py-4">MA 50 Dist</th>
                      <th className="px-6 py-4">Revision</th>
                      <th className="px-6 py-4">FWD P/E</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {watchlistItems.map((t) => (
                      <tr
                        key={t.symbol}
                        className="hover:bg-slate-50 transition-colors text-xs"
                      >
                        <td className="px-6 py-4 font-bold text-sm">
                          {t.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold">
                              ${t.price}
                            </span>
                            <span
                              className={`font-semibold ${
                                t.change1D != null && t.change1D >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
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
                              className={`font-bold ${
                                t.drawdown < -10
                                  ? "text-red-500"
                                  : "text-slate-600"
                              }`}
                            >
                              {t.drawdown.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold ${
                              t.rs > 110
                                ? "text-green-600"
                                : t.rs < 90
                                  ? "text-red-600"
                                  : "text-slate-600"
                            }`}
                          >
                            {t.rs.toFixed(1)}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 font-mono font-bold ${
                            t.ma50Dist > 10
                              ? "text-orange-600"
                              : t.ma50Dist < -5
                                ? "text-green-600"
                                : "text-slate-600"
                          }`}
                        >
                          {t.ma50Dist >= 0 ? "+" : ""}
                          {t.ma50Dist.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              REVISION_COLORS[t.revision] ??
                              REVISION_COLORS.NEUTRAL
                            }`}
                          >
                            {t.revision}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {t.forwardPE != null
                            ? `${t.forwardPE.toFixed(1)}x`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] px-2 py-1 rounded font-bold ${
                              ACTION_COLORS[t.action] ?? ACTION_COLORS.Hold
                            }`}
                          >
                            {t.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Monitoring List */}
        {activeTab === "monitoring" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="text-purple-600" size={24} />
                  Monitoring List (Expansion Set)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  9 Additional Tickers | Secondary Monitoring Matrix
                </p>
              </div>
            </div>
            {monitoring.isPending && (
              <div className="p-6">
                <TableSkeleton rows={9} />
              </div>
            )}
            {monitoring.error && (
              <p className="p-6 text-red-500">
                Error: {monitoring.error.message}
              </p>
            )}
            {monitoringItems.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Symbol</th>
                      <th className="px-6 py-4">Price / 1D %</th>
                      <th className="px-6 py-4">High / Drawdown</th>
                      <th className="px-6 py-4">Relative Strength</th>
                      <th className="px-6 py-4">MA 50 Dist</th>
                      <th className="px-6 py-4">Revision</th>
                      <th className="px-6 py-4">FWD P/E</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monitoringItems.map((t) => (
                      <tr
                        key={t.symbol}
                        className="hover:bg-slate-50 transition-colors text-xs"
                      >
                        <td className="px-6 py-4 font-bold text-sm text-slate-900">
                          {t.symbol}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold">
                              ${t.price}
                            </span>
                            <span
                              className={`font-semibold ${
                                t.change1D != null && t.change1D >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
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
                              className={`font-bold ${
                                t.drawdown < -10
                                  ? "text-red-500"
                                  : "text-slate-600"
                              }`}
                            >
                              {t.drawdown.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold ${
                              t.rs > 110
                                ? "text-green-600"
                                : t.rs < 90
                                  ? "text-red-600"
                                  : "text-slate-600"
                            }`}
                          >
                            {t.rs.toFixed(1)}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 font-mono font-bold ${
                            t.ma50Dist > 10
                              ? "text-orange-600"
                              : t.ma50Dist < -5
                                ? "text-green-600"
                                : "text-slate-600"
                          }`}
                        >
                          {t.ma50Dist >= 0 ? "+" : ""}
                          {t.ma50Dist.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              REVISION_COLORS[t.revision] ??
                              REVISION_COLORS.NEUTRAL
                            }`}
                          >
                            {t.revision}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {t.forwardPE != null
                            ? `${t.forwardPE.toFixed(1)}x`
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] px-2 py-1 rounded font-bold ${
                              ACTION_COLORS[t.action] ?? ACTION_COLORS.Hold
                            }`}
                          >
                            {t.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-[10px] uppercase tracking-widest">
        Proprietary Analysis Framework | 18Y Senior Quant Strategy Engine |
        Market Intelligence Unit
      </div>
    </div>
  );
}
