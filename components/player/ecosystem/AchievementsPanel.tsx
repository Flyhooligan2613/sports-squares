"use client";

import { useMemo, useState } from "react";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import {
  achievementStats,
  CATEGORY_LABELS,
  evaluateAchievements,
  type AchievementCategory,
  type EcosystemAchievement,
} from "@/lib/platform/ecosystem/achievements/catalog";
import { RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";

export default function AchievementsPanel() {
  const { data, loading } = useRewardsCenter();
  const [filter, setFilter] = useState<AchievementCategory | "all">("all");
  const [showLocked, setShowLocked] = useState(true);

  const achievements = useMemo(() => {
    if (!data?.legacy) return [];
    return evaluateAchievements({
      legacy: {
        lifetimeWinnings: data.legacy.lifetimeWinnings,
        lifetimeWins: data.legacy.lifetimeWins,
        squaresWon: data.legacy.lifetimeWins,
        boardsPlayed: data.legacy.boardsPlayed,
        totalSquaresPurchased: data.legacy.totalSquares,
        seasonsPlayed: data.legacy.seasonsPlayed,
        yearsPlayed: data.legacy.seasonsPlayed,
        currentWinStreak: data.legacy.currentStreak,
        longestWinStreak: data.legacy.longestStreak,
      },
      mysteryBoxesOpened: data.legacy.mysteryBoxesOpened,
      qualifiedReferrals: data.referral.qualifiedReferrals,
      loginStreakDays: data.legacy.loginStreakDays,
      lifetimeTierCredits: data.dashboard.account.lifetimeTierCredits,
    });
  }, [data]);

  const stats = achievementStats(achievements);

  const filtered = achievements.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (!showLocked && !a.unlocked) return false;
    return true;
  });

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading achievements…</p>;
  }

  return (
    <div className="space-y-6">
      <LandingGlassCard className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-1">Achievements</p>
            <h2 className="text-2xl font-bold text-white">
              {stats.unlocked} / {stats.total} Unlocked
            </h2>
            <p className="text-sm text-sb-muted mt-1">{stats.pct}% complete · build your legacy</p>
          </div>
          <div className="h-2 w-48 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sb-purple to-amber-400 transition-all"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      </LandingGlassCard>

      <div className="flex flex-wrap gap-2 items-center">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map((cat) => (
          <FilterChip
            key={cat}
            active={filter === cat}
            onClick={() => setFilter(cat)}
            label={CATEGORY_LABELS[cat]}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowLocked((v) => !v)}
          className="ml-auto text-xs text-sb-muted hover:text-white"
        >
          {showLocked ? "Hide locked" : "Show locked"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
        active ? "bg-sb-purple/30 text-white border border-sb-purple/40" : "text-sb-muted hover:text-white bg-white/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function AchievementCard({ achievement }: { achievement: EcosystemAchievement }) {
  const rarity = RARITY_COLORS[achievement.rarity];
  const locked = !achievement.unlocked;

  return (
    <LandingGlassCard
      className={[
        "p-4 transition-all",
        locked ? "opacity-50 grayscale-[0.4]" : "",
      ].join(" ")}
      style={locked ? undefined : ({ borderColor: `${rarity.border}44` } as React.CSSProperties)}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{achievement.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] uppercase tracking-wider ${rarity.text}`}>{rarity.label}</p>
          <p className="font-semibold text-white truncate">{achievement.title}</p>
          <p className="text-xs text-sb-muted mt-0.5 line-clamp-2">{achievement.description}</p>
          {achievement.progress && !achievement.unlocked ? (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-sb-purple/70"
                  style={{
                    width: `${Math.round((achievement.progress.current / achievement.progress.target) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-sb-muted mt-1 tabular-nums">
                {achievement.progress.current} / {achievement.progress.target}
              </p>
            </div>
          ) : null}
        </div>
        {achievement.unlocked ? (
          <span className="text-emerald-400 text-xs shrink-0">✓</span>
        ) : null}
      </div>
    </LandingGlassCard>
  );
}
