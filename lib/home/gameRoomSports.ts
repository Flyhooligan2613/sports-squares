import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export interface GameRoomSportLink {
  label: string;
  href: string;
  available: boolean;
  cta?: string;
  emoji?: string;
}

export interface GameRoomSport {
  id: string;
  label: string;
  emoji: string;
  links: GameRoomSportLink[];
}

export const GAME_ROOM_SPORTS: GameRoomSport[] = [
  {
    id: "nfl",
    label: "NFL",
    emoji: "🏈",
    links: [
      { label: "Squares", href: "/games/nfl", available: true, cta: "Play Squares", emoji: "🟪" },
      { label: "Pick'em", href: "/pickem", available: true, cta: "Play Pick'em", emoji: "🎯" },
      { label: "Survivor X", href: "/survivor", available: true, cta: "Play Survivor X", emoji: "🛡️" },
      {
        label: PLATFORM_TERMS.contestCenter,
        href: "/contest-center",
        available: true,
        cta: `Browse ${PLATFORM_TERMS.contestCenter}`,
        emoji: "🏆",
      },
    ],
  },
  {
    id: "nba",
    label: "NBA",
    emoji: "🏀",
    links: [
      { label: "Squares", href: "/games/nba", available: true, cta: "Play Squares", emoji: "🟪" },
      {
        label: "Tournament Royale",
        href: "/tournament-royale",
        available: true,
        cta: "Enter Tournament Royale",
        emoji: "🏅",
      },
    ],
  },
  {
    id: "mlb",
    label: "MLB",
    emoji: "⚾",
    links: [
      { label: "Squares", href: "/games/mlb", available: true, cta: "Play Squares", emoji: "🟪" },
      { label: "Pick'em", href: "/baseball-pickem", available: true, cta: "Play Pick'em", emoji: "🎯" },
    ],
  },
  {
    id: "ncaaf",
    label: "NCAA",
    emoji: "🏈",
    links: [
      { label: "Squares", href: "/games/ncaaf", available: true, cta: "Play Squares", emoji: "🟪" },
      {
        label: "Tournament Royale",
        href: "/tournament-royale",
        available: true,
        cta: "Enter Tournament Royale",
        emoji: "🏅",
      },
    ],
  },
  {
    id: "soccer",
    label: "Soccer",
    emoji: "⚽",
    links: [
      {
        label: "Pick'em Royale",
        href: "/soccer-predictor",
        available: true,
        cta: "Play Pick'em Royale",
        emoji: "🎯",
      },
    ],
  },
  {
    id: "nhl",
    label: "NHL",
    emoji: "🏒",
    links: [
      {
        label: "Pick'em",
        href: "/pickem?sport=nhl",
        available: true,
        cta: "Play Pick'em",
        emoji: "🎯",
      },
    ],
  },
];
