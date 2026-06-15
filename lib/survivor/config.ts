import type { SurvivorModeDefinition } from "@/lib/survivor/types";

export const SURVIVOR_X_PUBLIC_NAME = "Survivor X™";

/** One shield per player per season — never purchasable. */
export const SURVIVOR_SHIELDS_PER_SEASON = 1;

/** Default shield visual design id (future seasonal variants extend this). */
export const SURVIVOR_SHIELD_DESIGN_DEFAULT = "classic";

export const SURVIVOR_DEFAULT_SPORT = "nfl" as const;

export const SURVIVOR_MODES: SurvivorModeDefinition[] = [
  {
    id: "classic",
    emoji: "🏆",
    title: "Classic Survivor",
    description: "One loss and you're out. The purest test of nerve all season.",
    lives: 1,
    available: true,
  },
  {
    id: "double_life",
    emoji: "🔥",
    title: "Double Life",
    description: "Two lives. Lose twice — then elimination. More room for strategy.",
    lives: 2,
    available: true,
  },
  {
    id: "turbo",
    emoji: "⚡",
    title: "Turbo Survivor",
    description: "Shorter seasonal sprints. Jump in late and chase a fast championship.",
    lives: 1,
    badge: "Coming soon",
    available: false,
  },
  {
    id: "global",
    emoji: "🌎",
    title: "Global Survivor",
    description: "The entire SquareBoards community. One pick. One chance. All season.",
    lives: 1,
    available: true,
  },
  {
    id: "private",
    emoji: "👥",
    title: "Private Survivor",
    description: "Friends and family leagues with invite codes, custom fees, and prizes.",
    lives: 1,
    badge: "Coming soon",
    available: false,
  },
];

export const SURVIVOR_TUTORIAL_STEPS = [
  {
    step: 1,
    title: "Pick one team",
    body: "Each week, lock in exactly one NFL team you believe will win.",
    emoji: "🏈",
  },
  {
    step: 2,
    title: "Win = survive",
    body: "If your team wins, you advance to next week with your legacy intact.",
    emoji: "✅",
  },
  {
    step: 3,
    title: "Lose = eliminated",
    body: "A loss ends your run — unless your Survivor Shield™ auto-saves you once per season.",
    emoji: "🛡️",
  },
  {
    step: 4,
    title: "Never repeat",
    body: "You can never choose the same team twice in a season. Plan ahead.",
    emoji: "🚫",
  },
  {
    step: 5,
    title: "Last one standing",
    body: "Survive every week until you're the champion — or the sole survivor left.",
    emoji: "👑",
  },
] as const;
