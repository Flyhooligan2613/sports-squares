/**
 * Client-safe progression helpers — Phase 3D.
 * Pure functions for rewards UI; no server/database imports.
 */

import type { PlayerTierSlug } from "@/lib/platform/ecosystem/types";
import {
  FEATURED_ACHIEVEMENTS,
  PROGRESS_GOALS,
  STREAK_COPY,
} from "@/lib/platform/language/rewardsLanguage";
import type { EcosystemAchievement } from "@/lib/platform/ecosystem/achievements/catalog";

export interface CreditHistoryEntry {
  id: string;
  entryType: "earn" | "spend";
  creditKind: string;
  amount: number;
  source: string;
  createdAt: string;
}

export interface ProgressGoal {
  id: string;
  label: string;
  current: number;
  target: number;
  pct: number;
}

export interface StreakSnapshot {
  dailyLoginDays: number;
  weeklyParticipationActive: boolean;
  activityStreakDays: number;
  copy: {
    daily: string;
    weekly: string;
    monthly: string;
  };
}

export function sumEarnedCreditsSince(
  history: CreditHistoryEntry[],
  days: number,
  now = Date.now()
): number {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return history
    .filter(
      (e) =>
        e.entryType === "earn" &&
        e.creditKind === "tier" &&
        new Date(e.createdAt).getTime() >= cutoff
    )
    .reduce((sum, e) => sum + e.amount, 0);
}

export function buildProgressGoals(input: {
  weeklyTierCredits: number;
  creditHistory: CreditHistoryEntry[];
  lifetimeTierCredits: number;
  tierProgressPct: number;
  creditsToNextTier: number;
}): ProgressGoal[] {
  const monthlyEarned = sumEarnedCreditsSince(input.creditHistory, 30);
  const seasonEarned = sumEarnedCreditsSince(input.creditHistory, 90);

  return [
    {
      id: "weekly",
      label: "Weekly",
      current: input.weeklyTierCredits,
      target: PROGRESS_GOALS.weeklyCredits,
      pct: Math.min(100, Math.round((input.weeklyTierCredits / PROGRESS_GOALS.weeklyCredits) * 100)),
    },
    {
      id: "monthly",
      label: "Monthly",
      current: monthlyEarned,
      target: PROGRESS_GOALS.monthlyCredits,
      pct: Math.min(100, Math.round((monthlyEarned / PROGRESS_GOALS.monthlyCredits) * 100)),
    },
    {
      id: "season",
      label: "Season",
      current: seasonEarned,
      target: PROGRESS_GOALS.seasonCredits,
      pct: Math.min(100, Math.round((seasonEarned / PROGRESS_GOALS.seasonCredits) * 100)),
    },
    {
      id: "lifetime",
      label: "Lifetime",
      current: input.lifetimeTierCredits,
      target: input.lifetimeTierCredits + Math.max(input.creditsToNextTier, 1),
      pct: input.tierProgressPct,
    },
  ];
}

export function buildStreakSnapshot(input: {
  loginStreakDays: number;
  weeklyTierCredits: number;
  currentWinStreak: number;
}): StreakSnapshot {
  const activityDays = Math.max(input.loginStreakDays, input.currentWinStreak);
  return {
    dailyLoginDays: input.loginStreakDays,
    weeklyParticipationActive: input.weeklyTierCredits > 0,
    activityStreakDays: activityDays,
    copy: {
      daily: STREAK_COPY.dailyLogin(input.loginStreakDays),
      weekly: STREAK_COPY.weeklyParticipation(input.weeklyTierCredits > 0),
      monthly: STREAK_COPY.monthlyActivity(activityDays),
    },
  };
}

export function resolveFeaturedAchievements(
  achievements: EcosystemAchievement[]
): (EcosystemAchievement & { rewardLabel: string })[] {
  const byId = new Map(achievements.map((a) => [a.id, a]));
  return FEATURED_ACHIEVEMENTS.map((featured) => {
    const resolved = byId.get(featured.id);
    return {
      id: featured.id,
      title: featured.title,
      description: featured.description,
      emoji: featured.emoji,
      category: resolved?.category ?? "legend",
      rarity: resolved?.rarity ?? "common",
      unlocked: resolved?.unlocked ?? false,
      progress: resolved?.progress,
      rewardLabel: featured.rewardLabel,
    };
  });
}

export function upcomingMilestones(
  achievements: EcosystemAchievement[],
  limit = 4
): EcosystemAchievement[] {
  return achievements
    .filter((a) => !a.unlocked && a.progress)
    .sort((a, b) => {
      const aPct = a.progress ? a.progress.current / a.progress.target : 0;
      const bPct = b.progress ? b.progress.current / b.progress.target : 0;
      return bPct - aPct;
    })
    .slice(0, limit);
}

export function tierRequirementLabel(
  slug: PlayerTierSlug,
  minLifetimeCredits: number,
  isCurrent: boolean,
  isUnlocked: boolean
): string {
  if (isCurrent) return "Current tier";
  if (isUnlocked) return "Unlocked";
  return `${minLifetimeCredits.toLocaleString()} lifetime credits required`;
}

export interface RewardHistoryRow {
  id: string;
  title: string;
  date: string;
  source: string;
  status: string;
  reference: string;
  kind: "earn" | "spend" | "redemption";
}

export function buildRewardHistoryTimeline(input: {
  creditHistory: CreditHistoryEntry[];
  redemptionHistory: Array<{
    id: string;
    credits_spent: number;
    status: string;
    created_at: string;
    catalog_item_id?: string;
  }>;
}): RewardHistoryRow[] {
  const creditRows: RewardHistoryRow[] = input.creditHistory
    .filter((e) => e.entryType === "earn")
    .map((e) => ({
      id: e.id,
      title: `+${e.amount} Tier Credits`,
      date: e.createdAt,
      source: e.source.replace(/_/g, " "),
      status: "earned",
      reference: e.id.slice(0, 8),
      kind: "earn" as const,
    }));

  const redemptionRows: RewardHistoryRow[] = input.redemptionHistory.map((r) => ({
    id: r.id,
    title: `${(r.credits_spent as number).toLocaleString()} credits redeemed`,
    date: r.created_at as string,
    source: "credit shop",
    status: (r.status as string) ?? "pending",
    reference: ((r.catalog_item_id as string) ?? r.id).slice(0, 8),
    kind: "redemption" as const,
  }));

  return [...creditRows, ...redemptionRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
