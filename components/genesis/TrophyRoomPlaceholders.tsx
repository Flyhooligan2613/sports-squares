"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { GENESIS_LOCKED_TROPHY_PLACEHOLDERS } from "@/lib/platform/engines/genesis";

export default function TrophyRoomPlaceholders() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {GENESIS_LOCKED_TROPHY_PLACEHOLDERS.map((trophy, index) => (
        <LandingGlassCard
          key={trophy.id}
          className="p-4 text-center border border-white/5 opacity-70 admin-stat-enter"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <span className="text-3xl block mb-2 grayscale opacity-60" aria-hidden>
            {trophy.emoji}
          </span>
          <p className="text-sm font-semibold text-white/80">{trophy.title}</p>
          <p className="text-xs text-sb-muted mt-1">{trophy.hint}</p>
          <p className="text-[10px] uppercase tracking-wider text-sb-muted/70 mt-2">Locked</p>
        </LandingGlassCard>
      ))}
    </div>
  );
}
