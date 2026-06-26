"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import AliveEmptyState from "@/components/alive/AliveEmptyState";
import MicroCelebration from "@/components/alive/MicroCelebration";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import RewardsProgressBar from "@/components/player/ecosystem/RewardsProgressBar";
import { useRewardsCenter } from "@/components/player/ecosystem/RewardsCenterProvider";
import {
  achievementStats,
  CATEGORY_LABELS,
  evaluateAchievements,
  type AchievementCategory,
  type EcosystemAchievement,
} from "@/lib/platform/ecosystem/achievements/catalog";
import { RARITY_COLORS } from "@/lib/platform/ecosystem/weeklyRewardDropTypes";
import { REWARDS_EMPTY } from "@/lib/platform/language/rewardsLanguage";

export default function AchievementsPanel() {
  const { data, loading } = useRewardsCenter();
  const [filter, setFilter] = useState<AchievementCategory | "all">("all");
  const [showLocked, setShowLocked] = useState(true);
  const [genesisIds, setGenesisIds] = useState<string[]>([]);
  const [celebrateTrigger, setCelebrateTrigger] = useState(0);
  const [celebrateLabel, setCelebrateLabel] = useState("");
  const prevUnlockedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    void fetch("/api/genesis/progress", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.starterAchievements) {
          setGenesisIds(json.starterAchievements.map((a: { id: string }) => a.id));
        }
      })
      .catch(() => undefined);
  }, []);

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
      genesisAchievementIds: genesisIds,
    });
  }, [data, genesisIds]);

  useEffect(() => {
    const unlocked = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id));
    if (prevUnlockedRef.current.size > 0) {
      for (const a of achievements) {
        if (a.unlocked && !prevUnlockedRef.current.has(a.id)) {
          setCelebrateLabel(`${a.emoji} ${a.title} unlocked`);
          setCelebrateTrigger((t) => t + 1);
          break;
        }
      }
    }
    prevUnlockedRef.current = unlocked;
  }, [achievements]);

  const stats = achievementStats(achievements);

  const filtered = achievements.filter((a) => {
    if (filter !== "all" && a.category !== filter) return false;
    if (!showLocked && !a.unlocked) return false;
    return true;
  });

  if (loading || !data) {
    return <p className="text-center text-sb-muted py-16 animate-pulse">Loading achievements…</p>;
  }

  const isEmpty = stats.unlocked === 0 && (data.legacy?.boardsPlayed ?? 0) === 0;

  return (
    <div className="space-y-6">
      <MicroCelebration trigger={celebrateTrigger} label={celebrateLabel} tier="medium" />

      <LandingGlassCard className="p-6 sb-card-lift">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-1">Achievements</p>
            <h2 className="text-2xl font-bold text-white">
              {stats.unlocked} / {stats.total} Unlocked
            </h2>
            <p className="text-sm text-sb-muted mt-1">{stats.pct}% complete · build your legacy</p>
          </div>
          <RewardsProgressBar
            label="Overall progress"
            current={stats.unlocked}
            target={stats.total}
            pct={stats.pct}
            className="w-full sm:w-48"
          />
        </div>
      </LandingGlassCard>

      {isEmpty ? (
        <AliveEmptyState
          context="no_rewards"
          title={REWARDS_EMPTY.noAchievementsTitle}
          body={REWARDS_EMPTY.noAchievementsBody}
          emoji="🎖️"
        />
      ) : null}

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
          className="ml-auto text-xs text-sb-muted hover:text-white min-h-[44px] px-2"
          aria-pressed={showLocked}
        >
          {showLocked ? "Hide locked" : "Show locked"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <AliveEmptyState
              context="no_rewards"
              title="More achievements await"
              body="Adjust filters or join contests to unlock wins, streaks, and Square Drop milestones."
              emoji="🎖️"
            />
          </div>
        ) : (
          filtered.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))
        )}
      </div>

      <p className="text-center text-xs text-sb-muted">
        <Link href="/contest-center" className="text-sb-glow hover:underline">
          Browse contests
        </Link>{" "}
        to earn your next achievement
      </p>
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
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[44px]",
        active ? "bg-sb-purple/30 text-white border border-sb-purple/40" : "text-sb-muted hover:text-white bg-white/5",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function achievementRewardLabel(achievement: EcosystemAchievement): string {
  if (achievement.unlocked) return "Unlocked";
  if (achievement.rarity === "mythic" || achievement.rarity === "immortal") return "Legend badge";
  if (achievement.category === "streaks") return "Streak recognition";
  return "Tier credits on unlock";
}

function AchievementCard({ achievement }: { achievement: EcosystemAchievement }) {
  const rarity = RARITY_COLORS[achievement.rarity];
  const locked = !achievement.unlocked;

  return (
    <LandingGlassCard
      className={[
        "p-4 transition-all sb-card-lift",
        locked ? "opacity-55 grayscale-[0.35]" : "rewards-achievement-unlock",
      ].join(" ")}
      style={locked ? undefined : ({ borderColor: `${rarity.border}44` } as React.CSSProperties)}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0" aria-hidden>
          {achievement.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-[10px] uppercase tracking-wider ${rarity.text}`}>{rarity.label}</p>
          <p className="font-semibold text-white">{achievement.title}</p>
          <p className="text-xs text-sb-muted mt-0.5 line-clamp-2">{achievement.description}</p>
          {achievement.progress && !achievement.unlocked ? (
            <div className="mt-2">
              <RewardsProgressBar
                label="Progress"
                current={achievement.progress.current}
                target={achievement.progress.target}
                pct={Math.round((achievement.progress.current / achievement.progress.target) * 100)}
              />
            </div>
          ) : null}
          <p className="text-[10px] text-sb-gold mt-2">Reward: {achievementRewardLabel(achievement)}</p>
        </div>
        {achievement.unlocked ? (
          <span className="text-emerald-400 text-xs shrink-0" aria-label="Unlocked">
            ✓
          </span>
        ) : (
          <span className="text-sb-muted text-[10px] shrink-0 uppercase tracking-wider">Locked</span>
        )}
      </div>
    </LandingGlassCard>
  );
}
