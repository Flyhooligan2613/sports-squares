"use client";

import Link from "next/link";
import LandingGlassCard from "@/components/landing/LandingGlassCard";
import type { GameDayProgressCenter } from "@/lib/gameDay/types";

export default function GameDayProgressCenterPanel({
  progress,
}: {
  progress: GameDayProgressCenter;
}) {
  return (
    <section className="mb-10 sm:mb-12">
      <h2 className="gd-section-title">Progress Center</h2>
      <LandingGlassCard className="p-5 sm:p-6 gd-progress-card">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-sb-glow font-semibold mb-1">
              {progress.tierLabel} Tier
            </p>
            <p className="text-sm text-sb-muted">{progress.legacyHeadline}</p>
          </div>
          <Link
            href="/my-games/rewards/tier"
            className="text-xs font-semibold text-sb-glow hover:text-white transition-colors"
          >
            Tier rewards →
          </Link>
        </div>

        <div className="gd-progress-bar-wrap mb-2">
          <div
            className="gd-progress-bar-fill"
            style={{ width: `${Math.min(100, progress.tierProgressPct)}%` }}
          />
        </div>
        <p className="text-xs text-sb-muted mb-6">
          {progress.nextTierLabel && progress.creditsToNextTier > 0
            ? `${progress.creditsToNextTier} credits to ${progress.nextTierLabel}`
            : `${progress.tierProgressPct}% tier progress`}
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Lifetime Wins</dt>
            <dd className="text-lg font-bold text-white tabular-nums">{progress.lifetimeWins}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Win Streak</dt>
            <dd className="text-lg font-bold text-sb-glow tabular-nums">
              {progress.currentWinStreak > 0 ? `🔥 ${progress.currentWinStreak}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Weekly XP</dt>
            <dd className="text-lg font-bold text-white tabular-nums">{progress.weeklyXpEarned}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-sb-muted">Login Streak</dt>
            <dd className="text-lg font-bold text-white tabular-nums">
              {progress.loginStreakDays}d
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
          <Link href="/my-games/profile" className="gd-progress-link">
            Legacy · {progress.boardsPlayed} boards
          </Link>
          <Link href="/my-games/rewards/achievements" className="gd-progress-link">
            Achievements · {progress.achievementsUnlocked}/{progress.achievementsTotal}
          </Link>
          {progress.achievementNear ? (
            <span className="text-xs text-sb-glow">🏅 {progress.achievementNear}</span>
          ) : null}
        </div>
      </LandingGlassCard>
    </section>
  );
}
