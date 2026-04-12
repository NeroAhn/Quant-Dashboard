"use client";
import { BookOpen } from "lucide-react";

export function MetricGuide() {
  return (
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
  );
}
