"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { CommunityPresenceData } from "@/lib/platform/alive/types";
import { ALIVE_COPY } from "@/lib/platform/language/aliveLanguage";

interface CommunityPresenceProps {
  data: CommunityPresenceData | null;
  loading?: boolean;
}

export default function CommunityPresence({ data, loading }: CommunityPresenceProps) {
  if (loading) {
    return (
      <LandingGlassCard className="p-4">
        <div className="sb-xp-skeleton h-5 w-40 mb-4" />
        <div className="sb-xp-skeleton h-24 rounded-xl" />
      </LandingGlassCard>
    );
  }

  if (!data) return null;

  return (
    <LandingGlassCard className="p-4 sm:p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-sb-muted mb-4">
        {ALIVE_COPY.communityPresenceTitle}
      </h3>

      <div className="space-y-4">
        {data.topWinnersToday.length > 0 ? (
          <div>
            <p className="text-xs text-sb-glow font-semibold mb-2">Top winners today</p>
            <ul className="space-y-1.5">
              {data.topWinnersToday.slice(0, 3).map((winner) => (
                <li
                  key={winner.id}
                  className="flex items-center justify-between text-sm text-white/90"
                >
                  <span>
                    🏆 {winner.label} · {winner.sport}
                  </span>
                  <span className="text-sb-gold font-semibold tabular-nums">{winner.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.trendingCompetitors.length > 0 ? (
          <div>
            <p className="text-xs text-sb-glow font-semibold mb-2">Trending competitors</p>
            <ul className="space-y-1.5">
              {data.trendingCompetitors.slice(0, 3).map((comp) => (
                <li key={comp.id} className="text-sm text-sb-muted">
                  <span className="text-white font-medium">{comp.label}</span>
                  {comp.detail ? ` · ${comp.detail}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}
