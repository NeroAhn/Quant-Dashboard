"use client";
import { ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";

const opportunities = [
  { title: "AI 수익화 가시성", desc: "빅테크 실적 발표 시 AI CAPEX 대비 매출 증명 기대" },
  { title: "금리 동결 사이클", desc: "PCE 하향 안정화 확인 시 연말 금리 인하 기대감 재부각" },
];

const risks = [
  { title: "지정학적 에너지 쇼크", desc: "WTI $100 돌파 시 스태그플레이션 리스크 상존" },
  { title: "금리 De-rating", desc: "10Y 금리 4.5% 도달 시 기술주 멀티플 축소 압력" },
];

export function SidePanel() {
  return (
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
              <div key={o.title} className="p-3 bg-green-950/20 border border-green-900/30 rounded-lg">
                <p className="text-sm font-bold">{o.title}</p>
                <p className="text-xs text-slate-400 mt-1">{o.desc}</p>
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
              <div key={r.title} className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                <p className="text-sm font-bold">{r.title}</p>
                <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
