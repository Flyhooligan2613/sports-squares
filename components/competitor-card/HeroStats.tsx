"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { HeroStat } from "@/lib/competitorCard/types";
import { AnimatedStatValue, SectionCard } from "./shared";

interface HeroStatsProps {
  stats: HeroStat[];
}

export default function HeroStats({ stats }: HeroStatsProps) {
  return (
    <SectionCard id="hero-stats" title={COMPETITOR_CARD_COPY.heroStats}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <LandingGlassCard
            key={stat.id}
            className="p-4 sm:p-5 admin-stat-enter"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <p className={`text-2xl sm:text-3xl font-bold ${stat.accent ?? "text-white"}`}>
              <AnimatedStatValue value={stat.value} format={stat.format} />
            </p>
            <p className="text-[10px] uppercase tracking-wider text-sb-muted mt-2">{stat.label}</p>
          </LandingGlassCard>
        ))}
      </div>
    </SectionCard>
  );
}
