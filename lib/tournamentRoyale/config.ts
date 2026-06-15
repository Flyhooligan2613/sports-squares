import type { TournamentDefinition, TournamentKey } from "@/lib/tournamentRoyale/types";

export const TOURNAMENT_ROYALE_PUBLIC_NAME = "Tournament Royale™";

export const CINDERELLA_METER_MAX = 100;

/** One Bracket Shield™ per player per tournament — never purchasable. */
export const BRACKET_SHIELDS_PER_TOURNAMENT = 1;

export const TOURNAMENT_DEFINITIONS: TournamentDefinition[] = [
  {
    key: "ncaab_mens",
    sport: "ncaab",
    emoji: "🏀",
    name: "NCAA Men's Tournament",
    description: "March Madness — predict every matchup from Selection Sunday to the Championship.",
    available: true,
  },
  {
    key: "ncaab_womens",
    sport: "ncaab",
    emoji: "🏀",
    name: "NCAA Women's Tournament",
    description: "The full women's bracket — every round, every upset, every moment.",
    available: true,
  },
  {
    key: "nba_playoffs",
    sport: "nba",
    emoji: "🏀",
    name: "NBA Playoffs",
    description: "Playoff bracket predictions with combo streaks and legacy rewards.",
    available: true,
  },
  {
    key: "nhl_playoffs",
    sport: "nhl",
    emoji: "🏒",
    name: "NHL Playoffs",
    description: "Stanley Cup path predictions — sixty minutes at a time.",
    available: true,
  },
  {
    key: "fifa_world_cup",
    sport: "soccer",
    emoji: "⚽",
    name: "FIFA World Cup",
    description: "Global stage bracket predictions.",
    available: false,
  },
  {
    key: "uefa_champions_league",
    sport: "soccer",
    emoji: "⚽",
    name: "UEFA Champions League",
    description: "Knockout round bracket predictions.",
    available: false,
  },
  {
    key: "college_baseball",
    sport: "mlb",
    emoji: "⚾",
    name: "College World Series",
    description: "College baseball bracket predictions.",
    available: false,
  },
  {
    key: "cfp",
    sport: "ncaaf",
    emoji: "🏈",
    name: "College Football Playoff",
    description: "Championship path predictions.",
    available: false,
  },
];

export const ROUND_LABELS_NCAAB = [
  "Round of 64",
  "Round of 32",
  "Sweet 16",
  "Elite Eight",
  "Final Four",
  "Championship",
] as const;

export function getTournamentDefinition(key: TournamentKey): TournamentDefinition {
  const def = TOURNAMENT_DEFINITIONS.find((t) => t.key === key);
  if (!def) throw new Error(`Unknown tournament: ${key}`);
  return def;
}

export function parseTournamentKey(raw: string | null | undefined): TournamentKey {
  const key = (raw ?? "ncaab_mens") as TournamentKey;
  return TOURNAMENT_DEFINITIONS.some((t) => t.key === key) ? key : "ncaab_mens";
}

export const TOURNAMENT_TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Predict each matchup",
    body: "Tap your winner for every game — from opening tip to the championship.",
    emoji: "🏀",
  },
  {
    step: 2,
    title: "Lock before tip-off",
    body: "Submit your bracket before games begin. Once the tournament starts, picks lock.",
    emoji: "🔒",
  },
  {
    step: 3,
    title: "Watch it come alive",
    body: "Winners advance automatically. Your path glows. Accuracy updates in real time.",
    emoji: "✨",
  },
  {
    step: 4,
    title: "Earn XP & Legacy",
    body: "Correct picks build XP, tier progress, achievements, and Tournament Reputation.",
    emoji: "⭐",
  },
  {
    step: 5,
    title: "Never stand still",
    body: "Cinderella Meter™, Bracket Combos™, daily challenges, and The Huddle keep you in the game.",
    emoji: "🔥",
  },
] as const;
