"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";
import GenesisEmptyState from "@/components/genesis/GenesisEmptyState";
import { SectionCard } from "./shared";

interface AchievementsGridProps {
  achievements: PlayerAchievement[];
}

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  return (
    <SectionCard id="achievements" title={COMPETITOR_CARD_COPY.achievements}>
      {achievements.length === 0 ? (
        <GenesisEmptyState
          emoji="🎖️"
          title="Starter achievements unlocked"
          description="You earned genesis badges at signup. Compete in contests and open your Weekly Reward Drop to unlock more achievements."
          actionLabel="View all achievements"
          actionHref="/my-games/rewards/achievements"
          context="achievements"
          compact
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <LandingGlassCard
              key={achievement.id}
              className="p-4 flex gap-3 admin-stat-enter"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <span className="text-2xl" aria-hidden>
                {achievement.emoji}
              </span>
              <div>
                <p className="font-semibold text-white">{achievement.title}</p>
                <p className="text-sm text-sb-muted mt-0.5">{achievement.description}</p>
              </div>
            </LandingGlassCard>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
