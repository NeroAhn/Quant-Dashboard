"use client";

import { TableSkeleton } from "@/components/skeleton";
import { getChangeColor, getDrawdownColor } from "@/lib/colors";
import type { OpportunityEntry } from "@/lib/opportunities/generator";

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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 font-bold";
  if (score >= 60) return "text-emerald-500 font-semibold";
  if (score >= 40) return "text-slate-600 font-semibold";
  return "text-slate-500";
}

interface Props {
  opportunities: OpportunityEntry[];
  isLoading: boolean;
}

export function OpportunityTable({ opportunities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="p-6">
        <TableSkeleton rows={10} />
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 text-sm">
        조건을 만족하는 종목이 없습니다. 최초 1회 생성에는 10~20초 걸릴 수
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
              <th className="px-4 py-4 w-10">#</th>
              <th className="px-4 py-4">종목</th>
              <th className="px-4 py-4">섹터</th>
              <th className="px-4 py-4">가격 / 1D %</th>
              <th className="px-4 py-4">52W 고가 / 낙폭</th>
              <th className="px-4 py-4">FWD P/E</th>
              <th className="px-4 py-4">시가총액</th>
              <th className="px-4 py-4">Opp Score</th>
              <th className="px-4 py-4">전략 메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {opportunities.map((o) => (
              <tr
                key={o.symbol}
                className="hover:bg-slate-50 transition-colors text-xs"
              >
                <td className="px-4 py-4 text-slate-400 font-mono">{o.rank}</td>
                <td className="px-4 py-4 font-bold text-sm">{o.symbol}</td>
                <td className="px-4 py-4 text-slate-500">{o.sector}</td>
                <td className="px-4 py-4">
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
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 font-mono">
                      ${formatPrice(o.high52w)}
                    </span>
                    <span
                      className={`font-bold ${getDrawdownColor(o.drawdown)}`}
                    >
                      {o.drawdown.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-700 font-mono font-semibold">
                  {o.forwardPE.toFixed(1)}x
                </td>
                <td className="px-4 py-4 text-slate-600 font-mono">
                  {formatMarketCap(o.marketCap)}
                </td>
                <td className={`px-4 py-4 font-mono ${getScoreColor(o.oppScore)}`}>
                  {o.oppScore.toFixed(1)}
                </td>
                <td className="px-4 py-4 text-slate-600 text-[11px] leading-snug max-w-[320px]">
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
        {opportunities.map((o) => (
          <div
            key={o.symbol}
            className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-400 font-mono text-xs">
                  #{o.rank}
                </span>
                <span className="font-bold text-sm">{o.symbol}</span>
                <span className="text-[10px] text-slate-400">{o.sector}</span>
              </div>
              <span
                className={`font-mono text-sm ${getScoreColor(o.oppScore)}`}
              >
                {o.oppScore.toFixed(1)}
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
                <span className="text-slate-400 block">낙폭</span>
                <span className={`font-bold ${getDrawdownColor(o.drawdown)}`}>
                  {o.drawdown.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">FWD P/E</span>
                <span className="font-mono font-semibold">
                  {o.forwardPE.toFixed(1)}x
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">시가총액</span>
                <span className="font-mono">{formatMarketCap(o.marketCap)}</span>
              </div>
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
