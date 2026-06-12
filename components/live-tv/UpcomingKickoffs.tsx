"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useKickoffCountdown } from "@/lib/motion/useKickoffCountdown";
import type { LiveTvKickoff } from "@/lib/liveTv/types";

interface UpcomingKickoffsProps {
  kickoffs: LiveTvKickoff[];
}

function KickoffRow({ item }: { item: LiveTvKickoff }) {
  const countdown = useKickoffCountdown(item.kickoffAt, item.status === "live");

  return (
    <Link
      href={item.poolId ? `/pool/${item.poolId}` : `/games/${item.sport}`}
      className="livetv-kickoff-row"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">
          {item.awayTeam} vs {item.homeTeam}
        </p>
        <p className="text-xs text-sb-muted uppercase">{item.sport}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-wider text-sb-muted">Kickoff</p>
        <p
          className={[
            "text-sm font-bold",
            countdown.isLive ? "lwc-text-live livetv-countdown-glow" : "text-white",
          ].join(" ")}
        >
          {countdown.label}
        </p>
      </div>
    </Link>
  );
}

export default function UpcomingKickoffs({ kickoffs }: UpcomingKickoffsProps) {
  return (
    <section>
      <h2 className="livetv-section-title">Upcoming Kickoffs</h2>
      <LandingGlassCard className="p-3 sm:p-4">
        <div className="space-y-1">
          {kickoffs.map((item) => (
            <KickoffRow key={item.gameId} item={item} />
          ))}
        </div>
      </LandingGlassCard>
    </section>
  );
}
