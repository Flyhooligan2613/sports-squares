"use client";

import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { ContestStatus } from "@/lib/contestCenter/types";

type CountdownPhase = "registration" | "kickoff" | "lock";

function resolvePhase(status: ContestStatus): CountdownPhase {
  if (status === "live" || status === "completed") return "kickoff";
  if (status === "locked" || status === "almost_full") return "lock";
  return "registration";
}

const PHASE_LABELS: Record<CountdownPhase, string> = {
  registration: "Registration closes",
  kickoff: "Game begins",
  lock: "Board locks",
};

interface ContestCountdownProps {
  kickoffAt?: string;
  status: ContestStatus;
  fallbackLabel?: string;
  className?: string;
  compact?: boolean;
}

export default function ContestCountdown({
  kickoffAt,
  status,
  fallbackLabel,
  className = "",
  compact = false,
}: ContestCountdownProps) {
  const phase = resolvePhase(status);
  const countdown = useKickoffCountdown(
    kickoffAt ?? new Date(Date.now() + 86_400_000).toISOString(),
    status === "live"
  );

  const label = kickoffAt ? countdown.label : (fallbackLabel ?? "—");
  const phaseLabel =
    countdown.isLive || status === "live"
      ? "Live Now"
      : PHASE_LABELS[phase];

  return (
    <div
      className={[
        "cc-countdown",
        compact ? "cc-countdown-compact" : "",
        countdown.isLive || status === "live" ? "cc-countdown-live" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="timer"
      aria-live="polite"
    >
      <span className="cc-countdown-phase">{phaseLabel}</span>
      <span className="cc-countdown-value">{label}</span>
    </div>
  );
}
