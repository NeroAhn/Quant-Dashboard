import type { Revision, ActionSignal } from "./types";
import { QUANT_THRESHOLDS } from "@/lib/constants";

const { EPSILON, RS_BUY, RS_TRIM, RS_WAIT, MA50_BUY, MA50_TRIM } = QUANT_THRESHOLDS;

/** Strict greater-than with epsilon tolerance (QENG-04) */
function gt(a: number, b: number): boolean {
  return a - b > EPSILON;
}

/** Strict less-than with epsilon tolerance (QENG-04) */
function lt(a: number, b: number): boolean {
  return b - a > EPSILON;
}

/**
 * 액션 시그널 판정 로직.
 * 평가 우선순위: Trim > Buy > Wait > Hold
 * D-08: Wait는 OR 로직 (Revision DOWN || RS < 90)
 */
export function getDecisionAction(rs: number, ma50Dist: number, revision: Revision): ActionSignal {
  // ASIG-02: Trim (과열) -- 가장 먼저 체크
  if (gt(rs, RS_TRIM) && gt(ma50Dist, MA50_TRIM)) return "Trim";
  // ASIG-01: Buy (퀄리티 딥)
  if (revision === "UP" && gt(rs, RS_BUY) && lt(ma50Dist, MA50_BUY)) return "Buy";
  // ASIG-03: Wait (약세) -- D-08: OR 로직
  if (revision === "DOWN" || lt(rs, RS_WAIT)) return "Wait";
  // ASIG-04: Hold (나머지)
  return "Hold";
}
