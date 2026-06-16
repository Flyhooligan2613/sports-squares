import { getEmailForPlayerSlug } from "@/lib/database/services/playerProfiles";
import { getPlayerLegacy } from "@/lib/database/services/playerLegacy";
import { getPlayerSocialProfile } from "@/lib/huddle/profileSocial";
import { getHuddlePlayerSummary } from "@/lib/huddle/profiles";
import { computeCompetitorScore } from "@/lib/competitorCard/competitorScore";
import { REPUTATION_TITLES } from "@/lib/competitorCard/config";
import type {
  CareerRecord,
  CareerShowcaseItem,
  CompetitorCardData,
  CompetitorCardMode,
  CompetitorCardSection,
  LegacyTimelineEvent,
  TrophyItem,
} from "@/lib/competitorCard/types";
import { getEcosystemDashboard } from "@/lib/platform/ecosystem/dashboard";
import { DEFAULT_AVATAR } from "@/lib/platform/ecosystem/avatars";
import { getPlayerPublicIdentity } from "@/lib/player/publicIdentity";
import { publicProfilePath } from "@/lib/player/slug";
import { normalizeEmail } from "@/lib/player/statsCore";
import { CONTEST_TERMS } from "@/lib/platform/language";
import type { PlayerAchievement } from "@/lib/player/legacyTypes";
import { getPodiumCareerStats } from "@/lib/platform/podium/awardPodium";

export interface BuildCompetitorCardOptions {
  email: string;
  slug: string;
  mode: CompetitorCardMode;
  viewerEmail?: string | null;
}

function buildReputationTitles(input: {
  isVerified: boolean;
  creatorLevel: string | null;
  longestStreak: number;
  lifetimeWins: number;
  seasonsPlayed: number;
  qualifiedReferrals: number;
  lifetimeWinnings: number;
}): string[] {
  const titles: string[] = [];
  if (input.isVerified) titles.push(REPUTATION_TITLES.verified);
  if (input.creatorLevel && input.creatorLevel !== "community_rookie") {
    titles.push(REPUTATION_TITLES.creator);
  }
  if (input.longestStreak >= 5) titles.push(REPUTATION_TITLES.streakMaster);
  if (input.lifetimeWins >= 10) titles.push(REPUTATION_TITLES.champion);
  if (input.seasonsPlayed >= 2) titles.push(REPUTATION_TITLES.veteran);
  if (input.qualifiedReferrals >= 3) titles.push(REPUTATION_TITLES.referrer);
  if (titles.length === 0 && input.lifetimeWinnings > 0) titles.push(REPUTATION_TITLES.rising);
  return titles;
}

function buildTrophies(
  achievements: PlayerAchievement[],
  lifetimeWins: number
): TrophyItem[] {
  const trophies: TrophyItem[] = achievements
    .filter((a) => a.unlocked)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      emoji: a.emoji,
      rarity:
        a.id === "streak_legend" || a.id === "veteran"
          ? "legendary"
          : a.id === "ten_wins" || a.id === "big_winner"
            ? "epic"
            : a.id === "first_win" || a.id === "hot_streak"
              ? "rare"
              : "common",
    }));

  if (lifetimeWins >= 25) {
    trophies.unshift({
      id: "trophy_quarter_master",
      title: "Quarter Master",
      description: "25+ lifetime contest wins",
      emoji: "🏅",
      rarity: "legendary",
    });
  } else if (lifetimeWins >= 5) {
    trophies.unshift({
      id: "trophy_contest_winner",
      title: "Contest Winner",
      description: "5+ lifetime contest wins",
      emoji: "🥇",
      rarity: "epic",
    });
  }

  return trophies;
}

function buildLegacyTimeline(
  winHighlights: { id: string; awayTeam: string; homeTeam: string; periodLabel: string; amount: number; wonAt: string }[],
  achievements: PlayerAchievement[]
): LegacyTimelineEvent[] {
  const events: LegacyTimelineEvent[] = [];

  for (const win of winHighlights.slice(0, 12)) {
    events.push({
      id: `win-${win.id}`,
      type: "win",
      title: `${win.awayTeam} vs ${win.homeTeam}`,
      subtitle: `Won ${win.periodLabel} · $${win.amount.toFixed(0)}`,
      at: win.wonAt,
      emoji: "🏆",
    });
  }

  for (const achievement of achievements.filter((a) => a.unlocked).slice(0, 6)) {
    events.push({
      id: `ach-${achievement.id}`,
      type: "achievement",
      title: achievement.title,
      subtitle: achievement.description,
      at: new Date().toISOString(),
      emoji: achievement.emoji,
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 16);
}

function buildCareerShowcase(
  winHighlights: { id: string; awayTeam: string; homeTeam: string; periodLabel: string; amount: number; wonAt: string }[],
  achievements: PlayerAchievement[],
  currentStreak: number
): CareerShowcaseItem[] {
  const items: CareerShowcaseItem[] = [];

  if (currentStreak >= 2) {
    items.push({
      id: "streak-active",
      type: "streak",
      title: `${currentStreak}-win streak`,
      subtitle: "Active competition momentum",
      emoji: "🔥",
    });
  }

  const topWin = winHighlights[0];
  if (topWin) {
    items.push({
      id: `showcase-${topWin.id}`,
      type: "win",
      title: `${topWin.awayTeam} @ ${topWin.homeTeam}`,
      subtitle: `${topWin.periodLabel} · $${topWin.amount.toFixed(0)}`,
      emoji: "🏆",
      at: topWin.wonAt,
    });
  }

  for (const achievement of achievements.filter((a) => a.unlocked).slice(0, 4)) {
    items.push({
      id: `showcase-${achievement.id}`,
      type: "achievement",
      title: achievement.title,
      subtitle: achievement.description,
      emoji: achievement.emoji,
    });
  }

  return items.slice(0, 6);
}

function buildCareerRecords(
  stats: {
    lifetimeWins: number;
    lifetimeWinnings: number;
    longestWinStreak: number;
    boardsPlayed: number;
    seasonsPlayed: number;
    squaresWon: number;
  },
  podium: {
    championships: number;
    runnerUp: number;
    thirdPlace: number;
    topTen: number;
    nearPerfect: number;
  }
): CareerRecord[] {
  const records: CareerRecord[] = [
    { id: "wins", label: "Lifetime Wins", value: stats.lifetimeWins.toLocaleString(), highlight: stats.lifetimeWins >= 5 },
    { id: "winnings", label: CONTEST_TERMS.lifetimeContestWinnings, value: `$${stats.lifetimeWinnings.toFixed(0)}`, highlight: stats.lifetimeWinnings >= 100 },
    { id: "streak", label: "Longest Streak", value: String(stats.longestWinStreak), highlight: stats.longestWinStreak >= 3 },
    { id: "boards", label: "Contests Entered", value: stats.boardsPlayed.toLocaleString() },
    { id: "seasons", label: "Seasons Competed", value: String(stats.seasonsPlayed) },
    { id: "squares", label: "Squares Won", value: stats.squaresWon.toLocaleString() },
  ];

  if (podium.championships + podium.runnerUp + podium.thirdPlace > 0) {
    records.unshift(
      { id: "podium-gold", label: "🥇 Championships", value: String(podium.championships), highlight: podium.championships >= 1 },
      { id: "podium-silver", label: "🥈 Runner-Up", value: String(podium.runnerUp), highlight: podium.runnerUp >= 1 },
      { id: "podium-bronze", label: "🥉 Third Place", value: String(podium.thirdPlace) },
      { id: "podium-top10", label: "Top 10 Finishes", value: String(podium.topTen) },
      { id: "near-perfect", label: "Near Perfect™", value: String(podium.nearPerfect), highlight: podium.nearPerfect >= 1 }
    );
  }

  return records;
}

export async function buildCompetitorCard(
  options: BuildCompetitorCardOptions
): Promise<CompetitorCardData | null> {
  const email = normalizeEmail(options.email);
  const viewer = options.viewerEmail ? normalizeEmail(options.viewerEmail) : null;
  const isOwner = viewer === email || options.mode === "own";

  const [legacy, dashboard, identity, social] = await Promise.all([
    getPlayerLegacy(email),
    getEcosystemDashboard(email).catch(() => null),
    getPlayerPublicIdentity(email).catch(() => null),
    getPlayerSocialProfile(options.slug, viewer).catch(() => null),
  ]);

  if (!legacy) return null;

  let huddleSummary = null;
  try {
    huddleSummary = await getHuddlePlayerSummary(email);
  } catch {
    /* optional */
  }

  const tier = dashboard?.tier;
  const account = dashboard?.account;
  const unlockedAchievements = legacy.achievements.filter((a) => a.unlocked);
  const winHighlights = social?.winHighlights ?? [];

  const score = computeCompetitorScore({
    boardsPlayed: legacy.stats.boardsPlayed,
    lifetimeWins: legacy.stats.lifetimeWins,
    unlockedAchievements: unlockedAchievements.length,
    longestWinStreak: legacy.stats.longestWinStreak,
    tierSortOrder: tier?.sortOrder ?? 1,
    followerCount: huddleSummary?.followerCount ?? account?.followerCount ?? 0,
    communityReputation: huddleSummary?.communityReputation ?? 0,
    qualifiedReferrals: dashboard?.referral.qualifiedReferrals ?? 0,
    state: null,
    city: null,
    friendCount: social?.followingCount ?? 0,
    friendRank: null,
  });

  const card: CompetitorCardData = {
    mode: options.mode,
    slug: options.slug,
    isOwner,
    sharePath: publicProfilePath(options.slug),
    identity: {
      displayName: identity?.publicLabel ?? legacy.publicLabel,
      slug: options.slug,
      playerId: identity?.playerId ?? account?.playerId ?? null,
      avatarEmoji: identity?.avatarEmoji ?? huddleSummary?.avatarEmoji ?? DEFAULT_AVATAR,
      bio: identity?.profileBio ?? huddleSummary?.bio ?? null,
      memberSince: legacy.memberSince,
      headline: legacy.headline,
      isVerified: huddleSummary?.isVerified ?? false,
      favoriteTeam: huddleSummary?.favoriteTeam ?? null,
      tierSlug: tier?.slug ?? "rookie",
      tierName: tier?.displayName ?? "Rookie",
      tierLevel: account?.tierLevel ?? 1,
    },
    score,
    heroStats: [
      { id: "score", label: "Competitor Score", value: score.total, format: "number", accent: "text-sb-glow" },
      { id: "wins", label: "Lifetime Wins", value: legacy.stats.lifetimeWins, format: "number", accent: "text-sb-success" },
      { id: "winnings", label: CONTEST_TERMS.lifetimeContestWinnings, value: legacy.stats.lifetimeWinnings, format: "currency", accent: "text-sb-gold" },
      { id: "streak", label: "Win Streak", value: legacy.stats.currentWinStreak, format: "number", accent: "text-orange-400" },
    ],
    tier: {
      slug: tier?.slug ?? "rookie",
      name: tier?.displayName ?? "Rookie",
      level: account?.tierLevel ?? 1,
      progressPct: dashboard?.tierProgressPct ?? 0,
      creditsToNext: dashboard?.creditsToNextTier ?? 0,
      nextTierName: dashboard?.nextTier?.displayName ?? null,
      lifetimeCredits: account?.lifetimeTierCredits ?? 0,
    },
    reputation: {
      titles: buildReputationTitles({
        isVerified: huddleSummary?.isVerified ?? false,
        creatorLevel: huddleSummary?.creatorLevel ?? null,
        longestStreak: legacy.stats.longestWinStreak,
        lifetimeWins: legacy.stats.lifetimeWins,
        seasonsPlayed: legacy.stats.seasonsPlayed,
        qualifiedReferrals: dashboard?.referral.qualifiedReferrals ?? 0,
        lifetimeWinnings: legacy.stats.lifetimeWinnings,
      }),
      communityReputation: huddleSummary?.communityReputation ?? 0,
      creatorLevel: huddleSummary?.creatorLevel ?? null,
      followerCount: huddleSummary?.followerCount ?? account?.followerCount ?? 0,
    },
    careerShowcase: buildCareerShowcase(winHighlights, legacy.achievements, legacy.stats.currentWinStreak),
    trophies: buildTrophies(legacy.achievements, legacy.stats.lifetimeWins),
    legacyTimeline: buildLegacyTimeline(winHighlights, legacy.achievements),
    season: {
      weeklyCredits: account?.weeklyTierCredits ?? 0,
      weeklyGameplayCents: account?.weeklyGameplayCents ?? 0,
      currentStreak: legacy.stats.currentWinStreak,
      longestStreak: legacy.stats.longestWinStreak,
      boardsThisSeason: legacy.stats.boardsPlayed,
      winsThisSeason: null,
    },
    careerRecords: buildCareerRecords(legacy.stats),
    rivalries: [],
    community: {
      followerCount: social?.followerCount ?? huddleSummary?.followerCount ?? 0,
      followingCount: social?.followingCount ?? huddleSummary?.followingCount ?? 0,
      viewerIsFollowing: social?.viewerIsFollowing ?? false,
      featuredFollowers: (social?.followers ?? []).slice(0, 6).map((f) => ({
        slug: f.slug,
        displayName: f.username,
        avatarEmoji: f.avatarEmoji,
        tierName: f.tierName,
      })),
    },
    achievements: unlockedAchievements,
    stats: legacy.stats,
    customization: {
      profileFrameId: account?.profileFrameId ?? null,
      featuredAchievementIds: unlockedAchievements.slice(0, 3).map((a) => a.id),
      favoriteTeam: huddleSummary?.favoriteTeam ?? null,
      bio: identity?.profileBio ?? null,
    },
    quickActions: {
      canFollow: !isOwner,
      canShare: true,
      canChallenge: false,
      canReport: !isOwner,
    },
  };

  return card;
}

export async function buildCompetitorCardBySlug(
  slug: string,
  viewerEmail?: string | null,
  mode: CompetitorCardMode = "public"
): Promise<CompetitorCardData | null> {
  const email = await getEmailForPlayerSlug(slug);
  if (!email) return null;
  return buildCompetitorCard({ email, slug, mode, viewerEmail });
}

export function extractCompetitorCardSection(
  card: CompetitorCardData,
  section: CompetitorCardSection
): Partial<CompetitorCardData> | CompetitorCardData {
  if (section === "full") return card;

  switch (section) {
    case "stats":
      return { heroStats: card.heroStats, stats: card.stats, score: card.score };
    case "legacy":
      return { legacyTimeline: card.legacyTimeline, careerRecords: card.careerRecords };
    case "trophies":
      return { trophies: card.trophies, careerShowcase: card.careerShowcase };
    case "rivalries":
      return { rivalries: card.rivalries };
    case "achievements":
      return { achievements: card.achievements };
    default:
      return card;
  }
}
