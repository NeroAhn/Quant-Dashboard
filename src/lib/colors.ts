import type { ActionSignal, Revision } from "@/types/dashboard";

export const ACTION_COLORS: Record<ActionSignal, string> = {
  Buy: "bg-green-100 text-green-700",
  Trim: "bg-orange-100 text-orange-700",
  Wait: "bg-red-100 text-red-700",
  Hold: "bg-slate-100 text-slate-600",
};

export const REVISION_COLORS: Record<Revision, string> = {
  UP: "bg-green-100 text-green-700",
  DOWN: "bg-red-100 text-red-700",
  NEUTRAL: "bg-slate-100 text-slate-500",
};

/** RS color coding per TAB2-06: >110 green, <90 red, else neutral */
export function getRsColor(rs: number): string {
  if (rs > 110) return "text-green-600";
  if (rs < 90) return "text-red-600";
  return "text-slate-600";
}

/** MA50 Distance color: >10% orange (overheat), <-5% green (dip), else neutral */
export function getMa50Color(dist: number): string {
  if (dist > 10) return "text-orange-600";
  if (dist < -5) return "text-green-600";
  return "text-slate-600";
}

/** Drawdown color: < -10% red, else neutral */
export function getDrawdownColor(dd: number): string {
  if (dd < -10) return "text-red-500";
  return "text-slate-600";
}

/** 1D change color: green if >= 0, red otherwise */
export function getChangeColor(change: number | null): string {
  if (change == null) return "text-slate-400";
  return change >= 0 ? "text-green-600" : "text-red-600";
}
