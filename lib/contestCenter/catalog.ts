import { FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME } from "@/lib/soccerPickem/config";
import { TOURNAMENT_ROYALE_PUBLIC_NAME } from "@/lib/tournamentRoyale/config";
import type { ContestKind, ContestListing, ContestStatus } from "@/lib/contestCenter/types";

export interface ContestTemplate {
  id: string;
  title: string;
  emoji: string;
  sport: string;
  sportKey: string;
  kind: ContestKind;
  href: string;
  accent: string;
  entryFeeLabel: string;
  durationLabel: string;
  contestType: string;
  filterTags: string[];
  searchTerms: string[];
  status?: ContestStatus;
}

export const CONTEST_TEMPLATES: ContestTemplate[] = [
  {
    id: "nfl-squares",
    title: "NFL Sports Squares™",
    emoji: "🏈",
    sport: "NFL",
    sportKey: "nfl",
    kind: "squares",
    href: "/games/nfl",
    accent: "#7b61ff",
    entryFeeLabel: "$1–$100",
    durationLabel: "Game day",
    contestType: "Squares",
    filterTags: ["all", "nfl", "trending"],
    searchTerms: ["nfl", "squares", "football", "sunday"],
  },
  {
    id: "nfl-pickem",
    title: "NFL Pick'em Royale™",
    emoji: "🎯",
    sport: "NFL",
    sportKey: "nfl",
    kind: "pickem",
    href: "/pickem",
    accent: "#22c55e",
    entryFeeLabel: "$1–$100",
    durationLabel: "Weekly season",
    contestType: "Pick'em",
    filterTags: ["all", "nfl", "pickem", "trending"],
    searchTerms: ["pickem", "pick'em", "nfl", "royale"],
  },
  {
    id: "survivor-x",
    title: "Survivor X™",
    emoji: "🛡",
    sport: "NFL",
    sportKey: "nfl",
    kind: "survivor",
    href: "/survivor",
    accent: "#f59e0b",
    entryFeeLabel: "Free tiers",
    durationLabel: "Full season",
    contestType: "Survivor",
    filterTags: ["all", "nfl", "survivor", "trending"],
    searchTerms: ["survivor", "elimination", "nfl"],
  },
  {
    id: "mlb-squares",
    title: "MLB Sports Squares™",
    emoji: "⚾",
    sport: "MLB",
    sportKey: "mlb",
    kind: "squares",
    href: "/games/mlb",
    accent: "#dc2626",
    entryFeeLabel: "$1–$100",
    durationLabel: "Game day",
    contestType: "Squares",
    filterTags: ["all", "mlb", "trending"],
    searchTerms: ["mlb", "baseball", "squares"],
  },
  {
    id: "mlb-pickem",
    title: "MLB Pick'em Royale™",
    emoji: "⚾",
    sport: "MLB",
    sportKey: "mlb",
    kind: "pickem",
    href: "/baseball-pickem",
    accent: "#ef4444",
    entryFeeLabel: "$1–$100",
    durationLabel: "Weekly season",
    contestType: "Pick'em",
    filterTags: ["all", "mlb", "pickem"],
    searchTerms: ["mlb", "pickem", "baseball"],
  },
  {
    id: "nba-squares",
    title: "NBA Sports Squares™",
    emoji: "🏀",
    sport: "NBA",
    sportKey: "nba",
    kind: "squares",
    href: "/games/nba",
    accent: "#f97316",
    entryFeeLabel: "$1–$100",
    durationLabel: "Game day",
    contestType: "Squares",
    filterTags: ["all", "nba"],
    searchTerms: ["nba", "basketball", "squares"],
  },
  {
    id: "tournament-royale",
    title: TOURNAMENT_ROYALE_PUBLIC_NAME,
    emoji: "🏆",
    sport: "NCAA / NBA",
    sportKey: "nba",
    kind: "tournament",
    href: "/tournament-royale",
    accent: "#3b82f6",
    entryFeeLabel: "Free entry",
    durationLabel: "Tournament run",
    contestType: "Bracket",
    filterTags: ["all", "nba", "tournament", "new"],
    searchTerms: ["bracket", "tournament", "march madness", "royale"],
  },
  {
    id: "soccer-pickem",
    title: FOOTBALL_PICKEM_ROYALE_PUBLIC_NAME,
    emoji: "⚽",
    sport: "Football",
    sportKey: "football",
    kind: "pickem",
    href: "/soccer-predictor",
    accent: "#06b6d4",
    entryFeeLabel: "$1–$100",
    durationLabel: "Matchday",
    contestType: "Pick'em",
    filterTags: ["all", "football", "pickem"],
    searchTerms: ["soccer", "football", "pickem", "champions league"],
  },
  {
    id: "nhl-pickem",
    title: "NHL Pick'em Royale™",
    emoji: "🏒",
    sport: "NHL",
    sportKey: "nhl",
    kind: "pickem",
    href: "/pickem?sport=nhl",
    accent: "#38bdf8",
    entryFeeLabel: "Coming soon",
    durationLabel: "Season",
    contestType: "Pick'em",
    filterTags: ["all", "nhl", "pickem", "new"],
    searchTerms: ["nhl", "hockey", "stanley cup"],
    status: "coming_soon",
  },
];

export function templateToListing(
  template: ContestTemplate,
  overrides: Partial<ContestListing> = {}
): ContestListing {
  return {
    id: template.id,
    title: template.title,
    emoji: template.emoji,
    sport: template.sport,
    sportKey: template.sportKey,
    kind: template.kind,
    status: template.status ?? "open",
    href: template.href,
    entryFeeLabel: template.entryFeeLabel,
    durationLabel: template.durationLabel,
    contestType: template.contestType,
    accent: template.accent,
    searchTerms: template.searchTerms,
    playersJoined: overrides.playersJoined,
    prizePoolLabel: overrides.prizePoolLabel,
    remainingSpots: overrides.remainingSpots,
    totalSpots: overrides.totalSpots,
    fillPercent: overrides.fillPercent,
    kickoffAt: overrides.kickoffAt,
    gameTimeLabel: overrides.gameTimeLabel,
    trendingBadge: overrides.trendingBadge,
    featured: overrides.featured,
    subtitle: overrides.subtitle,
    filterTags: template.filterTags,
  };
}
