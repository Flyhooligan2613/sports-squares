import { PLATFORM_GAMES, type PlatformGameId } from "@/lib/platform/gameTypes";
import { ECOSYSTEM_FEATURE_TAGLINES } from "@/lib/platform/gameTaglines";
import { FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/soccerPickem/config";
import { WEEKLY_REWARD_DROP_PUBLIC_NAME } from "@/lib/platform/ecosystem/squareDropBrand";
import { COMMUNITY_LABELS, PROFILE_LABELS } from "@/lib/platform/language";

export type EcosystemFeatureStatus = "available" | "coming_soon";

export interface EcosystemFeature {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  bullets: string[];
  href: string | null;
  status: EcosystemFeatureStatus;
  accent?: string;
}

const GAME_CARD_OVERRIDES: Record<
  PlatformGameId,
  Pick<EcosystemFeature, "emoji" | "title" | "bullets">
> = {
  squareboards: {
    emoji: "🏈",
    title: "NFL Squares",
    bullets: ["Highlight Squares™", "Live quarter scoring", "Automatic payouts"],
  },
  "nba-squares": {
    emoji: "🏀",
    title: "NBA Squares",
    bullets: ["Quarter winners", "Highlight Squares™", "Live scoring"],
  },
  "mlb-squares": {
    emoji: "⚾",
    title: "MLB Squares",
    bullets: ["Inning checkpoints", "Highlight Squares™", "Live scoring"],
  },
  pickem: {
    emoji: "🏈",
    title: "Pick'em",
    bullets: ["Weekly contests", "Streaks", COMMUNITY_LABELS.competitionRankings],
  },
  "baseball-pickem": {
    emoji: "⚾",
    title: "MLB Pick'em",
    bullets: ["Season-long competition", "Build winning streaks", "Live standings"],
  },
  survivor: {
    emoji: "🏆",
    title: "Survivor X™",
    bullets: ["One pick per week", "Live survival map", "Hall of Fame legacy"],
  },
  brackets: {
    emoji: "🏀",
    title: "Brackets",
    bullets: ["March Madness", "Tournament scoring", "Big prizes"],
  },
  "soccer-predictor": {
    emoji: "⚽",
    title: FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME,
    bullets: ["Matchweek picks", "Live matchday", "Global leaderboards"],
  },
};

function gameToFeature(gameId: PlatformGameId): EcosystemFeature | null {
  const game = PLATFORM_GAMES.find((g) => g.id === gameId);
  const override = GAME_CARD_OVERRIDES[gameId];
  if (!game || !override) return null;

  return {
    id: game.id,
    emoji: override.emoji,
    title: override.title,
    tagline: game.tagline,
    bullets: override.bullets,
    href: game.href,
    status: game.status,
    accent: game.accent,
  };
}

/** Platform features beyond individual games — extend this array as the ecosystem grows. */
const PLATFORM_FEATURES: EcosystemFeature[] = [
  {
    id: "weekly-rewards",
    emoji: "🎁",
    title: WEEKLY_REWARD_DROP_PUBLIC_NAME,
    tagline: ECOSYSTEM_FEATURE_TAGLINES["weekly-rewards"],
    bullets: [
      "Gameplay rewards",
      "Referral bonuses",
      "Achievements & promotions",
    ],
    href: "/my-games/rewards/square-drop",
    status: "available",
    accent: "#a78bfa",
  },
  {
    id: "achievements",
    emoji: "🏆",
    title: "Achievements",
    tagline: ECOSYSTEM_FEATURE_TAGLINES.achievements,
    bullets: ["Unlock badges", "Earn XP", "Level up", "Build your legacy"],
    href: "/my-games/rewards/achievements",
    status: "available",
    accent: "#f59e0b",
  },
  {
    id: "player-profiles",
    emoji: "👤",
    title: "Player Profiles",
    tagline: ECOSYSTEM_FEATURE_TAGLINES["player-profiles"],
    bullets: ["Wins & stats", "Followers", "Bio & emoji", "Public player page"],
    href: "/my-games/profile",
    status: "available",
    accent: "#7b61ff",
  },
  {
    id: "huddle",
    emoji: "👥",
    title: "The Huddle",
    tagline: ECOSYSTEM_FEATURE_TAGLINES.huddle,
    bullets: ["Community feed", "Share picks", "Follow players", "Trending picks"],
    href: "/huddle",
    status: "available",
    accent: "#22c55e",
  },
  {
    id: "stats-hub",
    emoji: "📊",
    title: "Stats Hub",
    tagline: ECOSYSTEM_FEATURE_TAGLINES["stats-hub"],
    bullets: ["Live standings", "League rankings", "Team statistics"],
    href: "/stats-hub",
    status: "available",
    accent: "#3b82f6",
  },
  {
    id: "leaderboards",
    emoji: "🏅",
    title: COMMUNITY_LABELS.competitionRankings,
    tagline: ECOSYSTEM_FEATURE_TAGLINES.leaderboards,
    bullets: ["Global rankings", "Top competitors", "Referral & community"],
    href: "/leaderboards",
    status: "available",
    accent: "#ec4899",
  },
];

const AVAILABLE_GAME_ORDER: PlatformGameId[] = [
  "squareboards",
  "nba-squares",
  "mlb-squares",
  "pickem",
  "survivor",
  "baseball-pickem",
  "brackets",
  "soccer-predictor",
];

/** Homepage ecosystem grid — games first, then platform features, then coming soon. */
export function getHomeEcosystemFeatures(): EcosystemFeature[] {
  const games = AVAILABLE_GAME_ORDER.map(gameToFeature).filter(
    (feature): feature is EcosystemFeature => feature !== null
  );

  const comingSoonGames = PLATFORM_GAMES.filter((g) => g.status === "coming_soon");
  const comingSoonCard: EcosystemFeature = {
    id: "more-games",
    emoji: "🎮",
    title: "More Games Coming",
    tagline: ECOSYSTEM_FEATURE_TAGLINES["more-games"],
    bullets: comingSoonGames.map((g) => g.name).concat("And more…"),
    href: null,
    status: "coming_soon",
    accent: "#6366f1",
  };

  return [...games, ...PLATFORM_FEATURES, comingSoonCard];
}

export interface PlatformValuePillar {
  emoji: string;
  title: string;
}

export const PLATFORM_VALUE_PILLARS: PlatformValuePillar[] = [
  { emoji: "🎮", title: "Multiple Premium Games" },
  { emoji: "🏆", title: "Weekly Rewards" },
  { emoji: "📈", title: "Player Progression" },
  { emoji: "👥", title: "Community" },
  { emoji: "💰", title: "Automatic Payouts" },
  { emoji: "📊", title: "Live Sports Data" },
  { emoji: "🎁", title: "Seasonal Events" },
  { emoji: "⭐", title: "Achievements" },
  { emoji: "🌎", title: `Global ${COMMUNITY_LABELS.competitionRankings}` },
];
