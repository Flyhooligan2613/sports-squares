import { PLATFORM_GAMES, type PlatformGameId } from "@/lib/platform/gameTypes";
import { WEEKLY_REWARD_DROP_PUBLIC_NAME } from "@/lib/platform/ecosystem/squareDropBrand";

export type EcosystemFeatureStatus = "available" | "coming_soon";

export interface EcosystemFeature {
  id: string;
  emoji: string;
  title: string;
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
    emoji: "🎲",
    title: "Sports Squares",
    bullets: ["Highlight Squares™", "Live scoring", "Automatic payouts"],
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
    bullets: ["Weekly contests", "Streaks", "Leaderboards"],
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
    title: "Soccer Predictor",
    bullets: ["Global match picks", "League leaderboards", "Worldwide competition"],
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
    bullets: ["Unlock badges", "Earn XP", "Level up", "Build your legacy"],
    href: "/my-games/rewards/achievements",
    status: "available",
    accent: "#f59e0b",
  },
  {
    id: "player-profiles",
    emoji: "👤",
    title: "Player Profiles",
    bullets: ["Wins & stats", "Followers", "Bio & emoji", "Public player page"],
    href: "/my-games/profile",
    status: "available",
    accent: "#7b61ff",
  },
  {
    id: "huddle",
    emoji: "👥",
    title: "The Huddle",
    bullets: ["Community feed", "Share picks", "Follow players", "Trending picks"],
    href: "/huddle",
    status: "available",
    accent: "#22c55e",
  },
  {
    id: "stats-hub",
    emoji: "📊",
    title: "Stats Hub",
    bullets: ["Live standings", "League rankings", "Team statistics"],
    href: "/stats-hub",
    status: "available",
    accent: "#3b82f6",
  },
  {
    id: "leaderboards",
    emoji: "🏅",
    title: "Leaderboards",
    bullets: ["Global rankings", "State leaders", "Referral & community"],
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
  { emoji: "🌎", title: "Global Leaderboards" },
];
