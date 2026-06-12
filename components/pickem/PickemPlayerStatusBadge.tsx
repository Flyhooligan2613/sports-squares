"use client";

import { CheckCircle2, Trophy, XCircle, Zap, Split } from "lucide-react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { PickemPlayerPoolStatus } from "@/lib/pickem/types";

const STATUS_CONFIG = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  eliminated: {
    label: "Eliminated",
    icon: XCircle,
    className: "text-red-400/90 bg-red-500/10 border-red-500/30",
  },
  tiebreaker: {
    label: "Advanced to Championship Tiebreaker",
    icon: Zap,
    className: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  },
  winner: {
    label: "Winner",
    icon: Trophy,
    className: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
  },
  prize_split: {
    label: "Prize Split",
    icon: Split,
    className: "text-purple-300 bg-purple-500/10 border-purple-500/30",
  },
} as const;

interface PickemPlayerStatusBadgeProps {
  status: PickemPlayerPoolStatus;
}

export default function PickemPlayerStatusBadge({ status }: PickemPlayerStatusBadgeProps) {
  if (!status.status) return null;

  const config = STATUS_CONFIG[status.status];
  const Icon = config.icon;

  return (
    <LandingGlassCard className={`p-4 mb-6 border ${config.className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">{config.label}</p>
          {status.poolLabel ? (
            <p className="text-xs opacity-80 mt-0.5">
              {status.poolLabel}
              {status.sundayRecord ? ` · Sunday record ${status.sundayRecord}` : ""}
            </p>
          ) : null}
        </div>
        {status.payoutCents != null && status.payoutCents > 0 ? (
          <span className="ml-auto text-sm font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(status.payoutCents / 100)}
          </span>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}
