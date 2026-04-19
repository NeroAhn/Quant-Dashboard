"use client";

import { TableSkeleton } from "@/components/skeleton";
import { getChangeColor } from "@/lib/colors";
import type { BuffettMetrics } from "@/types/buffett";

function formatMarketCap(mc: number): string {
  if (mc >= 1e12) return `$${(mc / 1e12).toFixed(2)}T`;
  if (mc >= 1e9) return `$${(mc / 1e9).toFixed(1)}B`;
  if (mc >= 1e6) return `$${(mc / 1e6).toFixed(0)}M`;
  return `$${mc}`;
}

function formatPrice(p: number): string {
  if (p >= 1000) return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return p.toFixed(2);
}

function formatPct(v: number | null, digits = 1): string {
  if (v == null || !isFinite(v)) return "N/A";
  return `${(v * 100).toFixed(digits)}%`;
}

function mosColor(mos: number | null): string {
  if (mos == null) return "text-slate-400";
  if (mos <= -0.3) return "text-emerald-600 font-bold";
  if (mos <= -0.1) return "text-emerald-500 font-semibold";
  if (mos <= 0) return "text-slate-600";
  return "text-red-500";
}

function roeColor(roe: number | null, allAbove: boolean): string {
  if (roe == null) return "text-slate-400";
  if (allAbove) return "text-emerald-600 font-bold";
  if (roe >= 0.15) return "text-emerald-500 font-semibold";
  return "text-slate-600";
}

function debtColor(years: number | null): string {
  if (years == null) return "text-slate-400";
  if (years < 3) return "text-emerald-600 font-bold";
  if (years < 5) return "text-slate-600 font-semibold";
  return "text-red-500 font-bold";
}

function rsiColor(rsi: number | null): string {
  if (rsi == null) return "text-slate-400";
  if (rsi < 30) return "text-emerald-600 font-bold";
  if (rsi > 70) return "text-red-500 font-bold";
  return "text-slate-600";
}

function CheckPill({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold ${
        pass
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-slate-50 text-slate-400 border border-slate-200"
      }`}
      title={label}
    >
      {pass ? "✓" : "·"} {label}
    </span>
  );
}

interface Props {
  entries: BuffettMetrics[];
  isLoading: boolean;
}

export function OpportunityTable({ entries, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 text-sm">
        조건을 만족하는 종목이 없습니다. 최초 1회 생성은 30~60초 걸릴 수
        있습니다.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold">
            <tr>
              <th className="px-3 py-4 w-10">#</th>
              <th className="px-3 py-4">종목</th>
              <th className="px-3 py-4">섹터</th>
              <th className="px-3 py-4">가격 / 1D %</th>
              <th className="px-3 py-4">내재가 / MoS</th>
              <th className="px-3 py-4">4y ROE</th>
              <th className="px-3 py-4">Debt/NI (years)</th>
              <th className="px-3 py-4">RSI 14</th>
              <th className="px-3 py-4">시가총액</th>
              <th className="px-3 py-4">Buffett 체크</th>
              <th className="px-3 py-4">전략 메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((o, idx) => (
              <tr
                key={o.symbol}
                className={`hover:bg-slate-50 transition-colors text-xs ${
                  o.pick.all ? "bg-amber-50/50" : ""
                }`}
              >
                <td className="px-3 py-4 text-slate-400 font-mono">
                  {idx + 1}
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm flex items-center gap-1">
                      {o.symbol}
                      {o.pick.all && (
                        <span
                          title="Buffett Pick: MoS ≤ -30% + ROE ≥ 15% + D/E < 3y + RSI < 30"
                          className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300"
                        >
                          ⭐ PICK
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                      {o.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-slate-500">{o.sector}</td>
                <td className="px-3 py-4">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold">
                      ${formatPrice(o.price)}
                    </span>
                    <span
                      className={`font-semibold ${getChangeColor(o.change1D)}`}
                    >
                      {o.change1D != null
                        ? `${o.change1D >= 0 ? "+" : ""}${o.change1D.toFixed(2)}%`
                        : "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-mono">
                      {o.intrinsicPerShare != null
                        ? `$${formatPrice(o.intrinsicPerShare)}`
                        : "N/A"}
                    </span>
                    <span className={`font-mono ${mosColor(o.marginOfSafety)}`}>
                      {formatPct(o.marginOfSafety)}
                    </span>
                  </div>
                </td>
                <td
                  className={`px-3 py-4 font-mono ${roeColor(o.avgRoe4y, o.allYearsRoeAbove15)}`}
                  title={
                    o.roeHistory
                      .map((h) => `${h.year}: ${(h.roe * 100).toFixed(1)}%`)
                      .join(" | ") || "no history"
                  }
                >
                  {formatPct(o.avgRoe4y)}
                </td>
                <td
                  className={`px-3 py-4 font-mono ${debtColor(o.debtToEarningsYears)}`}
                >
                  {o.debtToEarningsYears == null
                    ? "N/A"
                    : o.debtToEarningsYears === 0
                      ? "Net Cash"
                      : `${o.debtToEarningsYears.toFixed(1)}y`}
                </td>
                <td className={`px-3 py-4 font-mono ${rsiColor(o.rsi14)}`}>
                  {o.rsi14 != null ? o.rsi14.toFixed(1) : "N/A"}
                </td>
                <td className="px-3 py-4 text-slate-600 font-mono">
                  {formatMarketCap(o.marketCap)}
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-1">
                    <CheckPill pass={o.pick.mosPass} label="MoS" />
                    <CheckPill pass={o.pick.roePass} label="ROE" />
                    <CheckPill pass={o.pick.debtPass} label="Debt" />
                    <CheckPill pass={o.pick.rsiPass} label="RSI" />
                  </div>
                </td>
                <td className="px-3 py-4 text-slate-600 text-[11px] leading-snug max-w-[280px]">
                  {o.memo ?? (
                    <span className="text-slate-300">생성 대기</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-4">
        {entries.map((o, idx) => (
          <div
            key={o.symbol}
            className={`bg-white rounded-xl border p-4 space-y-3 shadow-sm ${
              o.pick.all ? "border-amber-300 bg-amber-50/40" : "border-slate-200"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-mono text-xs">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-sm">{o.symbol}</span>
                  {o.pick.all && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-300">
                      ⭐ PICK
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{o.sector}</span>
                </div>
                <span className="text-[11px] text-slate-600 truncate max-w-[260px]">
                  {o.name}
                </span>
              </div>
              <span
                className={`font-mono text-sm ${mosColor(o.marginOfSafety)}`}
              >
                {formatPct(o.marginOfSafety)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">가격</span>
                <span className="font-mono font-bold">${formatPrice(o.price)}</span>
                <span
                  className={`ml-1 font-semibold ${getChangeColor(o.change1D)}`}
                >
                  {o.change1D != null
                    ? `${o.change1D >= 0 ? "+" : ""}${o.change1D.toFixed(2)}%`
                    : ""}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">내재가</span>
                <span className="font-mono">
                  {o.intrinsicPerShare != null
                    ? `$${formatPrice(o.intrinsicPerShare)}`
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">4y ROE</span>
                <span
                  className={`font-mono ${roeColor(o.avgRoe4y, o.allYearsRoeAbove15)}`}
                >
                  {formatPct(o.avgRoe4y)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Debt/NI</span>
                <span
                  className={`font-mono ${debtColor(o.debtToEarningsYears)}`}
                >
                  {o.debtToEarningsYears == null
                    ? "N/A"
                    : o.debtToEarningsYears === 0
                      ? "Net Cash"
                      : `${o.debtToEarningsYears.toFixed(1)}y`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">RSI</span>
                <span className={`font-mono ${rsiColor(o.rsi14)}`}>
                  {o.rsi14 != null ? o.rsi14.toFixed(1) : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">시가총액</span>
                <span className="font-mono">{formatMarketCap(o.marketCap)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
              <CheckPill pass={o.pick.mosPass} label="MoS" />
              <CheckPill pass={o.pick.roePass} label="ROE" />
              <CheckPill pass={o.pick.debtPass} label="Debt" />
              <CheckPill pass={o.pick.rsiPass} label="RSI" />
            </div>
            {o.memo && (
              <div className="text-[11px] text-slate-600 leading-snug pt-1 border-t border-slate-100">
                <span className="text-slate-400 block mb-0.5">전략 메모</span>
                {o.memo}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
