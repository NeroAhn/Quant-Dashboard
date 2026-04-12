"use client";

import { ACTION_COLORS } from "@/lib/colors";
import type { ActionSignal } from "@/types/dashboard";

export function ActionBadge({ action }: { action: ActionSignal }) {
  return (
    <span
      className={`text-[10px] px-2 py-1 rounded font-bold ${ACTION_COLORS[action]}`}
    >
      {action}
    </span>
  );
}
