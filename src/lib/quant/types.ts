export type Revision = "UP" | "DOWN" | "NEUTRAL";
export type ActionSignal = "Buy" | "Trim" | "Wait" | "Hold";

export interface QuantMetrics {
  rs: number;           // Relative Strength (D-09: 1D 기준)
  ma50Dist: number;     // MA50 이격도 (%)
  drawdown: number;     // 52주 고가 대비 하락률 (%)
  revision: Revision;   // EPS Revision 방향
  action: ActionSignal; // 조건부 액션 시그널
}

// ASIG-05: 시그널 색상 코딩 매핑
export const ACTION_SIGNAL_COLORS: Record<ActionSignal, string> = {
  Buy: "green",
  Trim: "red",
  Wait: "yellow",
  Hold: "gray",
};
