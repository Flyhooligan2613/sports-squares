"use client";

import ConfettiCelebration from "@/components/live-winners/ConfettiCelebration";
import { ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

interface MicroCelebrationProps {
  trigger: number;
  label?: string;
  tier?: "medium" | "large";
}

export default function MicroCelebration({
  trigger,
  label = ALIVE_COPY.celebrationMilestone,
  tier = "medium",
}: MicroCelebrationProps) {
  if (!trigger) return null;

  return (
    <div className="alive-micro-celebration relative">
      <ConfettiCelebration trigger={trigger} tier={tier} />
      {label ? (
        <p className="alive-badge-shimmer text-xs font-semibold text-sb-gold text-center mt-2">
          {label}
        </p>
      ) : null}
    </div>
  );
}
