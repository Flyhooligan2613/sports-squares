import type { GameDayAtmosphereTheme, GameDayPhase } from "@/lib/gameDay/types";

export type DailyStoryTheme =
  | GameDayAtmosphereTheme
  | "nfl"
  | "mlb"
  | "nba"
  | "nhl"
  | "soccer"
  | "progression"
  | "general";

export interface DailyStory {
  id: string;
  emoji: string;
  body: string;
  theme: DailyStoryTheme;
}

export interface DailyStoryDefinition {
  id: string;
  emoji: string;
  body: string;
  tags: string[];
  weight: number;
}

export interface DailyStoryContext {
  email: string;
  now: Date;
  phase: GameDayPhase;
  atmosphereTheme: GameDayAtmosphereTheme;
  favoriteSport: "nfl" | "mlb" | "nba" | null;
  tierLabel: string;
  tierProgressPct: number;
  creditsToNextTier: number;
  nextTierLabel: string | null;
  currentWinStreak: number;
  weeklyDropAvailable: boolean;
  survivorPickWaiting: boolean;
  winsToday: number;
  isGameDay: boolean;
}
