"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { SeasonDashboardData } from "@/lib/competitorCard/types";
import { AnimatedStatValue, SectionCard } from "./shared";

interface SeasonDashboardProps {
  season: SeasonDashboardData;
}

export default function SeasonDashboard({ season }: SeasonDashboardProps) {
  return (
    <SectionCard id="season-dashboard" title={COMPETITOR_CARD_COPY.seasonDashboard}>
      <LandingGlassCard className="p-6 sm:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Weekly Credits" value={season.weeklyCredits} />
          <Stat label="Current Streak" value={season.currentStreak} accent="text-orange-400" />
          <Stat label="Longest Streak" value={season.longestStreak} />
          <Stat label="Contests Entered" value={season.boardsThisSeason} />
          <Stat
            label="Weekly Gameplay"
            value={season.weeklyGameplayCents / 100}
            format="currency"
          />
        </div>
      </LandingGlassCard>
    </SectionCard>
  );
}

function Stat({
  label,
  value,
  format = "number",
  accent = "text-white",
}: {
  label: string;
  value: number;
  format?: "number" | "currency";
  accent?: string;
}) {
  return (
    <div>
      <p className={`text-xl sm:text-2xl font-bold ${accent}`}>
        <AnimatedStatValue value={value} format={format === "currency" ? "currency" : "number"} />
      </p>
      <p className="text-[10px] uppercase tracking-wider text-sb-muted mt-1">{label}</p>
    </div>
  );
}
