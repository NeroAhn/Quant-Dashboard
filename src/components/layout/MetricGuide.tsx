"use client";
import { BookOpen, Gem } from "lucide-react";

export function MetricGuide() {
  return (
    <div className="max-w-7xl mx-auto mb-8 space-y-4">
      {/* Quant Metrics Guide */}
      <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
        <h2 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
          <BookOpen size={18} />
          Quant 지표 가이드 (Alpha Watchlist Manual)
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

      {/* Buffett Metrics Guide */}
      <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm">
        <h2 className="text-sm font-bold text-amber-800 mb-4 flex items-center gap-2">
          <Gem size={18} />
          Buffett 가치투자 지표 가이드 (Opp · Watchlist 공통)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">
              내재가 / MoS (Margin of Safety)
            </p>
            <p className="text-sm text-slate-700 leading-tight font-medium">
              10년 DCF(할인율 10%, 성장률 clamp -5~20%)로 추정한 주당 가치.
              MoS = (현재가 / 내재가) - 1. <b>-30% 이하(30% 이상 할인)</b>가
              버핏의 매수 문턱.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">
              4Y ROE (자기자본이익률)
            </p>
            <p className="text-sm text-slate-700 leading-tight font-medium">
              자기자본 대비 수익 창출 효율. <b>≥ 15%</b>를 꾸준히 유지하는
              기업이 &apos;경제적 해자(Moat)&apos;를 가진 우량주. Yahoo 한계상
              현재 ROE 기준으로 대체 산출.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Debt / NI (부채 상환 기간)
            </p>
            <p className="text-sm text-slate-700 leading-tight font-medium">
              순부채(총부채-현금) ÷ 최근 3년 평균 순이익. <b>&lt;3년 안전</b>,
              3~5년 중립, <b>≥5년 위험</b>. &quot;몇 해 벌어 빚을 갚는가&quot;를
              본다.
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase">
              RSI 14 (상대강도지수)
            </p>
            <p className="text-sm text-slate-700 leading-tight font-medium">
              14일 가격 모멘텀. <b>&lt;30 과매도</b>(공포, 매수 기회), 30~70
              중립, <b>&gt;70 과열</b>. 역발상 진입 타이밍 지표.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-amber-100 text-[11px] text-slate-600 leading-relaxed">
          <b className="text-amber-700">⭐ Buffett PICK</b> 배지는 위 네 조건을
          모두 만족한 종목에만 부여됩니다: MoS ≤ -30% <span className="mx-1">·</span>
          4Y ROE ≥ 15% <span className="mx-1">·</span> Debt/NI &lt; 3년{" "}
          <span className="mx-1">·</span> RSI &lt; 30. &quot;공포에 사서 탐욕에
          파는&quot; 역발상의 교차점입니다.
        </div>
      </div>
    </div>
  );
}
