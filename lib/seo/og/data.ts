import { buildCompetitorCardBySlug } from "@/lib/competitorCard/buildCompetitorCard";
import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getPlayerWinHighlights } from "@/lib/huddle/winHighlights";
import { getLeaderboards } from "@/lib/database/services/leaderboards";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import type {
  AchievementShareData,
  ContestShareData,
  LeaderboardShareData,
  LevelUpShareData,
  ProfileShareData,
  ReferralShareData,
  SeasonShareData,
  StoryShareData,
  TrophyShareData,
  WinnerShareData,
} from "@/lib/seo/og/types";

function formatWorldRankLabel(worldPercentile: number | null): string {
  if (worldPercentile == null || worldPercentile <= 0) return "Unranked";
  return `Top ${worldPercentile}% Worldwide`;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export async function fetchProfileShareData(username: string): Promise<ProfileShareData | null> {
  const card = await buildCompetitorCardBySlug(username).catch(() => null);
  if (!card) return null;

  const showcase = card.trophies[0] ?? card.careerShowcase[0];

  return {
    username: card.slug,
    displayName: card.identity.displayName,
    avatarEmoji: card.identity.avatarEmoji,
    competitorScore: card.score.total,
    rankTitle: card.score.rankTitle,
    tierName: card.identity.tierName,
    level: card.identity.tierLevel,
    worldRankLabel: formatWorldRankLabel(card.score.percentiles.world),
    headline: card.identity.headline,
    followers: card.reputation.followerCount,
    winStreak: card.stats.currentWinStreak,
    favoriteSport: card.identity.favoriteTeam ?? "Multi-Sport",
    showcaseAchievement: showcase
      ? { title: showcase.title, emoji: showcase.emoji ?? "🏆" }
      : null,
    badges: card.reputation.titles.slice(0, 4),
  };
}

export async function fetchContestShareData(id: string): Promise<ContestShareData | null> {
  const contest = await getPickemContestById(id).catch(() => null);
  if (!contest) return null;

  const maxPlayers = 10000;
  const spotsRemaining = Math.max(0, maxPlayers - contest.playerCount);

  return {
    id: contest.id,
    name: contest.label,
    sport: contest.sport.toUpperCase(),
    entryFeeLabel: "Free Entry",
    prizePoolLabel: formatCurrency(contest.prizePoolCents),
    playerCount: contest.playerCount,
    spotsRemaining,
    countdownLabel: contest.status === "open" ? "Entries Open" : "In Progress",
    status: contest.status,
  };
}

export async function fetchWinnerShareData(
  username: string,
  winId: string
): Promise<WinnerShareData | null> {
  const email = await getEmailForPlayerSlug(username);
  if (!email) return null;

  const [identity, legacy, wins] = await Promise.all([
    getPlayerPublicIdentity(email),
    getPlayerLegacy(email),
    getPlayerWinHighlights(email, 40),
  ]);

  const win = wins.find((w) => w.id === winId) ?? wins[0];
  if (!win) return null;

  return {
    username,
    displayName: identity.publicLabel,
    avatarEmoji: identity.avatarEmoji ?? DEFAULT_AVATAR,
    contestName: `${win.awayTeam} vs ${win.homeTeam}`,
    placement: win.periodLabel,
    prizeLabel: `$${win.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    scoreEarned: legacy?.stats.lifetimeWins ?? 0,
    winStreak: legacy?.stats.currentWinStreak ?? 0,
  };
}

export async function fetchLevelUpShareData(
  username: string,
  tierSlug: string
): Promise<LevelUpShareData | null> {
  const email = await getEmailForPlayerSlug(username);
  if (!email) return null;

  const [identity, dashboard, card] = await Promise.all([
    getPlayerPublicIdentity(email),
    getEcosystemDashboard(email).catch(() => null),
    buildCompetitorCardBySlug(username).catch(() => null),
  ]);

  if (!dashboard) return null;

  const tiers = await import("@/lib/platform/ecosystem/tiers").then((m) => m.listTierDefinitions());
  const currentIdx = tiers.findIndex((t) => t.slug === tierSlug);
  const newTier = tiers[currentIdx] ?? dashboard.tier;
  const oldTier = tiers[Math.max(0, currentIdx - 1)] ?? tiers[0];

  return {
    username,
    displayName: identity.publicLabel,
    avatarEmoji: identity.avatarEmoji ?? DEFAULT_AVATAR,
    oldTier: oldTier.displayName,
    newTier: newTier.displayName,
    competitorScore: card?.score.total ?? 0,
    progressPct: dashboard.tierProgressPct,
  };
}

export async function fetchAchievementShareData(
  username: string,
  achievementId: string
): Promise<AchievementShareData | null> {
  const email = await getEmailForPlayerSlug(username);
  if (!email) return null;

  const [identity, legacy] = await Promise.all([
    getPlayerPublicIdentity(email),
    getPlayerLegacy(email),
  ]);

  const achievement = legacy?.achievements.find((a) => a.id === achievementId && a.unlocked);
  if (!achievement) return null;

  return {
    username,
    displayName: identity.publicLabel,
    avatarEmoji: identity.avatarEmoji ?? DEFAULT_AVATAR,
    achievementName: achievement.title,
    description: achievement.description,
    emoji: achievement.emoji,
    unlockedLabel: "Unlocked",
  };
}

export async function fetchTrophyShareData(
  username: string,
  trophyId: string
): Promise<TrophyShareData | null> {
  const card = await buildCompetitorCardBySlug(username).catch(() => null);
  if (!card) return null;

  const trophy = card.trophies.find((t) => t.id === trophyId) ?? card.trophies[0];
  if (!trophy) return null;

  return {
    username,
    displayName: card.identity.displayName,
    avatarEmoji: card.identity.avatarEmoji,
    trophyTitle: trophy.title,
    competition: card.identity.favoriteTeam ?? "SquareBoards Competition",
    placement: trophy.rarity === "legendary" ? "1st Place" : "Podium",
    prizeLabel: `$${card.stats.lifetimeWinnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    dateLabel: new Date(card.identity.memberSince).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
  };
}

export async function fetchReferralShareData(code: string): Promise<ReferralShareData | null> {
  const supabase = getSupabaseAdmin();
  const normalized = code.trim().toUpperCase();

  const { data: referrer } = await supabase
    .from("player_profiles")
    .select("email, player_id")
    .eq("player_id", normalized)
    .maybeSingle();

  if (!referrer?.email) return null;

  const identity = await getPlayerPublicIdentity(normalizeEmail(referrer.email as string));

  return {
    referrerName: identity.publicLabel,
    avatarEmoji: identity.avatarEmoji ?? DEFAULT_AVATAR,
    referralCode: normalized,
    rewardLabel: "Join with referral bonus",
    bonusLabel: "+500 Square Credits",
  };
}

export async function fetchLeaderboardShareData(
  period: string
): Promise<LeaderboardShareData | null> {
  const boards = await getLeaderboards().catch(() => null);
  if (!boards) return null;

  const periodMap: Record<string, { tab: LeaderboardShareData["period"]; boardId: string; label: string }> = {
    weekly: { tab: "weekly", boardId: "weekly-wins", label: "Weekly Rankings" },
    monthly: { tab: "monthly", boardId: "all-time-wins", label: "Monthly Rankings" },
    "all-time": { tab: "all-time", boardId: "all-time-winnings", label: "All-Time Rankings" },
  };

  const config = periodMap[period] ?? periodMap.weekly;
  const board = boards.boards.find((b) => b.id === config.boardId) ?? boards.boards[0];
  if (!board) return null;

  return {
    period: config.tab,
    periodLabel: config.label,
    topEntries: board.entries.slice(0, 3).map((e) => ({
      rank: e.rank,
      name: e.displayName,
      scoreLabel: e.valueLabel,
      tier: "Competitor",
      trend: e.rank <= 3 ? "▲" : "—",
    })),
  };
}

export async function fetchStoryShareData(
  username: string,
  storyId: string
): Promise<StoryShareData | null> {
  const card = await buildCompetitorCardBySlug(username).catch(() => null);
  if (!card) return null;

  const stories: Record<string, StoryShareData> = {
    "win-streak": {
      username,
      displayName: card.identity.displayName,
      avatarEmoji: card.identity.avatarEmoji,
      headline: `🔥 ${card.stats.currentWinStreak} Game Win Streak`,
      highlights: [
        `⭐ Competitor Score +${card.score.total}`,
        `🏆 Top ${card.score.percentiles.world ?? "—"}%`,
        `🎯 ${card.score.rankTitle}`,
      ],
    },
    "elite-predictor": {
      username,
      displayName: card.identity.displayName,
      avatarEmoji: card.identity.avatarEmoji,
      headline: "🎯 Elite Predictor",
      highlights: [
        `${card.stats.lifetimeWins} Lifetime Wins`,
        `$${card.stats.lifetimeWinnings.toLocaleString()} Won`,
        card.identity.tierName,
      ],
    },
  };

  return stories[storyId] ?? stories["win-streak"];
}

export async function fetchSeasonShareData(
  username: string,
  seasonKey: string
): Promise<SeasonShareData | null> {
  const card = await buildCompetitorCardBySlug(username).catch(() => null);
  if (!card) return null;

  return {
    username,
    displayName: card.identity.displayName,
    avatarEmoji: card.identity.avatarEmoji,
    seasonLabel: seasonKey.replace("-", "–"),
    totalWins: card.stats.lifetimeWins,
    totalEntries: card.stats.boardsPlayed,
    prizeMoneyLabel: `$${card.stats.lifetimeWinnings.toLocaleString()}`,
    bestSport: card.identity.favoriteTeam ?? "Multi-Sport",
    achievementCount: card.achievements.filter((a) => a.unlocked).length,
    favoriteCompetition: card.careerShowcase[0]?.title ?? "SquareBoards Pick'em",
    hoursPlayed: Math.max(card.stats.boardsPlayed * 2, 1),
    legacyProgressPct: card.tier.progressPct,
  };
}
