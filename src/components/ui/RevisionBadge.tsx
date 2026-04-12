"use client";

import { REVISION_COLORS } from "@/lib/colors";
import type { Revision } from "@/types/dashboard";

export function RevisionBadge({ revision }: { revision: Revision }) {
  return (
    <span
      className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${REVISION_COLORS[revision]}`}
    >
      {revision}
    </span>
  );
}
