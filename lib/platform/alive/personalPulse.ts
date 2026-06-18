import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { buildPlayerCard } from "@/lib/platform/ecosystem/dashboard";
import { computeTierLevel } from "@/lib/platform/ecosystem/tierVisuals";
import { ACHIEVEMENT_CATALOG_SIZE } from "@/lib/platform/ecosystem/achievements/catalog";
import { computeCompetitorScore } from "@/lib/competitorCard/competitorScore";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { fetchAutomationState } from "@/lib/platform/engines/squarePass/automation/repository";
import { buildGameDayMissions } from "@/lib/gameDay/missions";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { ALIVE_BRAND } from "@/lib/platform/language/aliveLanguage";
import type { AliveStat, PersonalPulse } from "./types";

async function countFollowers(email: string): Promise<number> {
  if (!isSupabaseAdminConfigured()) return 0;
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("huddle_player_follows")
    .select("*", { count: "exact", head: true })
    .eq("following_email", normalizeEmail(email));
  return count ?? 0;
}

export async function fetchPersonalPulse(email: string): Promise<PersonalPulse> {
  const normalized = normalizeEmail(email);
  const [
    legacy,
    ecosystem,
    playerCard,
    identity,
    walletDashboard,
    automation,
    followers,
  ] = await Promise.all([
    getPlayerLegacy(normalized),
    getEcosystemDashboard(normalized).catch(() => null),
    buildPlayerCard(normalized).catch(() => null),
    getPlayerPublicIdentity(normalized),
    SquareWalletEngine.getDashboard(normalized).catch(() => null),
    fetchAutomationState(normalized).catch(() => null),
    countFollowers(normalized),
  ]);

  const missions = buildGameDayMissions({
    activeSquares: legacy?.stats.boardsPlayed ?? 0,
    pickemCardsSubmitted: 0,
    pickemCardsTotal: 0,
    survivorPickWaiting: false,
    weeklyDropAvailable: false,
    followingCount: followers,
    hasJoinedBoardToday: false,
    xpEarnedToday: 0,
  });

  const achievementsUnlocked =
    legacy?.achievements.filter((a) => a.unlocked).length ?? 0;
  const tierSortOrder = ecosystem?.tier.sortOrder ?? 1;

  const score = computeCompetitorScore({
    boardsPlayed: legacy?.stats.boardsPlayed ?? 0,
    lifetimeWins: legacy?.stats.lifetimeWins ?? 0,
    unlockedAchievements: achievementsUnlocked,
    longestWinStreak: legacy?.stats.longestWinStreak ?? 0,
    tierSortOrder,
    followerCount: followers,
    communityReputation: 0,
    qualifiedReferrals: ecosystem?.referral.qualifiedReferrals ?? 0,
  });

  const tierLevel = playerCard?.computedTierLevel ?? computeTierLevel(
    ecosystem?.account.lifetimeTierCredits ?? 0,
    ecosystem?.tier.minLifetimeCredits ?? 0
  );

  const walletBalance =
    (walletDashboard?.balances.available ?? 0) +
    (walletDashboard?.balances.contestCredits ?? 0);
  const pendingWinnings = walletDashboard?.balances.pendingWinnings ?? 0;

  const squarePassActive = Boolean(
    automation?.welcomeCompletedAt || automation?.lastDailyBonusAt
  );

  const stats: AliveStat[] = [
    {
      label: ALIVE_BRAND.competitorScore,
      value: score.total.toLocaleString(),
      emoji: "⚡",
      source: "real",
    },
    {
      label: "Tier Level",
      value: tierLevel,
      emoji: "🎖️",
      source: "real",
    },
    {
      label: "Login Streak",
      value: playerCard?.legacy?.loginStreakDays ?? 0,
      emoji: "🔥",
      source: "real",
    },
    {
      label: ALIVE_BRAND.squareWallet,
      value: `$${(walletBalance / 100).toFixed(0)}`,
      emoji: "💳",
      source: walletDashboard ? "real" : "estimated",
    },
  ];

  return {
    updatedAt: new Date().toISOString(),
    displayName: identity.publicLabel || identity.displayName || "Competitor",
    competitorScore: score.total,
    competitorScoreRank: score.rankTitle,
    tierLabel: ecosystem?.tier.displayName ?? "Rookie",
    tierLevel,
    tierProgressPct: ecosystem?.tierProgressPct ?? 0,
    xpToNext: playerCard?.xpToNext ?? 0,
    loginStreakDays: playerCard?.legacy?.loginStreakDays ?? 0,
    achievementsUnlocked,
    achievementsTotal: ACHIEVEMENT_CATALOG_SIZE,
    walletBalanceCents: walletBalance,
    pendingWinningsCents: pendingWinnings,
    dailyMissionsComplete: missions.filter((m) => m.completed).length,
    dailyMissionsTotal: missions.length,
    squarePassActive,
    squarePassLabel: squarePassActive ? ALIVE_BRAND.squarePass : null,
    stats,
  };
}
