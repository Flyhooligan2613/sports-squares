"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { formatCurrency } from "@/lib/liveWinners/format";
import type { LiveTvSportMap } from "@/lib/liveTv/types";

interface PlatformSportMapProps {
  sports: LiveTvSportMap[];
}

export default function PlatformSportMap({ sports }: PlatformSportMapProps) {
  return (
    <section>
      <h2 className="livetv-section-title">Live Platform Map</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {sports.map((sport) => (
          <LandingGlassCard key={sport.sport} className="livetv-sport-map-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{sport.label}</h3>
              {sport.comingSoon ? (
                <span className="text-[10px] uppercase text-sb-muted">Soon</span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-sb-muted">Games</p>
                <p className="font-bold text-white tabular-nums">{sport.games}</p>
              </div>
              <div>
                <p className="text-sb-muted">Boards</p>
                <p className="font-bold text-white tabular-nums">{sport.boards}</p>
              </div>
              <div>
                <p className="text-sb-muted">Players</p>
                <p className="font-bold text-white tabular-nums">{sport.players}</p>
              </div>
              <div>
                <p className="text-sb-muted">Pools</p>
                <p className="font-bold text-sb-gold tabular-nums">
                  {sport.prizePools > 0 ? formatCurrency(sport.prizePools) : "—"}
                </p>
              </div>
            </div>
          </LandingGlassCard>
        ))}
      </div>
    </section>
  );
}
