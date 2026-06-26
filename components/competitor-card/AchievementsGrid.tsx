"use client";

import LandingGlassCard from "@/components/landing/LandingGlassCard";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import { COMPETITOR_CARD_COPY } from "@/lib/competitorCard/copy";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";
import { SectionCard } from "./shared";

interface AchievementsGridProps {
  achievements: PlayerAchievement[];
}

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <SectionCard id="achievements" title={COMPETITOR_CARD_COPY.achievements}>
      {achievements.length === 0 ? (
        <AliveEmptyState context="no_rewards" emoji="🎖️" title="Achievements await" />
      ) : (
        <>
          {unlocked.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {unlocked.map((achievement, index) => (
                <AchievementCard key={achievement.id} achievement={achievement} index={index} />
              ))}
            </div>
          ) : null}
          {locked.length > 0 ? (
            <>
              <p className="text-xs uppercase tracking-wider text-sb-muted mb-3">Locked</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {locked.map((achievement, index) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    index={index}
                    locked
                  />
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </SectionCard>
  );
}

function AchievementCard({
  achievement,
  index,
  locked = false,
}: {
  achievement: PlayerAchievement;
  index: number;
  locked?: boolean;
}) {
  return (
    <LandingGlassCard
      className={[
        "p-4 flex gap-3 admin-stat-enter sb-card-lift",
        locked ? "opacity-50" : "",
      ].join(" ")}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <span className="text-2xl" aria-hidden>
        {locked ? "🔒" : achievement.emoji}
      </span>
      <div>
        <p className="font-semibold text-white">{achievement.title}</p>
        <p className="text-sm text-sb-muted mt-0.5">{achievement.description}</p>
      </div>
    </LandingGlassCard>
  );
}
