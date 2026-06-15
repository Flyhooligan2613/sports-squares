import { PLATFORM_TERMS } from "@/lib/platform/legacy/competitiveLanguage";

export interface GameRoomSportLink {
  label: string;
  href: string;
  available: boolean;
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
      { label: "Squares", href: "/games/nfl", available: true },
      { label: "Pick'em", href: "/pickem", available: true },
      { label: "Survivor X", href: "/survivor", available: true },
      { label: PLATFORM_TERMS.contestCenter, href: "/contest-center", available: true },
    ],
  },
  {
    id: "nba",
    label: "NBA",
    emoji: "🏀",
    links: [
      { label: "Squares", href: "/games/nba", available: true },
      { label: "Tournament Royale", href: "/tournament-royale", available: true },
    ],
  },
  {
    id: "mlb",
    label: "MLB",
    emoji: "⚾",
    links: [
      { label: "Squares", href: "/games/mlb", available: true },
      { label: "Pick'em", href: "/baseball-pickem", available: true },
    ],
  },
  {
    id: "ncaaf",
    label: "NCAA",
    emoji: "🏈",
    links: [
      { label: "Squares", href: "/games/ncaaf", available: true },
      { label: "Tournament Royale", href: "/tournament-royale", available: true },
    ],
  },
  {
    id: "soccer",
    label: "Soccer",
    emoji: "⚽",
    links: [{ label: "Pick'em Royale", href: "/soccer-predictor", available: true }],
  },
  {
    id: "nhl",
    label: "NHL",
    emoji: "🏒",
    links: [{ label: "Coming soon", href: "#", available: false }],
  },
];
