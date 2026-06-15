import type { PickemAchievement } from "@/lib/pickem/types";

/** WNBA-specific Pick'em achievement definitions — merged with core pickem achievements at runtime. */
export const WNBA_PICKEM_ACHIEVEMENTS: Omit<PickemAchievement, "unlocked" | "unlockedAt">[] = [
  {
    id: "wnba-first-victory",
    title: "First WNBA Victory",
    description: "Correctly picked your first WNBA winner.",
    emoji: "🏀",
  },
  {
    id: "wnba-perfect-week",
    title: "Perfect Pick'em Week",
    description: "Went undefeated on a full WNBA weekly slate.",
    emoji: "💎",
  },
  {
    id: "wnba-commissioners-cup-week",
    title: "Commissioner's Cup Week",
    description: "Perfect week during Commissioner's Cup competition.",
    emoji: "🏆",
  },
  {
    id: "wnba-playoff-streak",
    title: "Playoff Streak",
    description: "Five consecutive correct picks during WNBA playoffs.",
    emoji: "🔥",
  },
  {
    id: "wnba-finals-prophet",
    title: "Finals Prophet",
    description: "Correctly predicted a WNBA Finals game winner.",
    emoji: "👑",
  },
  {
    id: "wnba-founding-competitor",
    title: "WNBA Founding Competitor",
    description: "Played in the inaugural WNBA Pick'em Royale™ season.",
    emoji: "⭐",
  },
];

export interface WnbaLegacyAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: "squares" | "pickem" | "legacy";
}

/** Platform legacy achievements ingestible when WNBA stats exist. */
export const WNBA_LEGACY_ACHIEVEMENTS: WnbaLegacyAchievement[] = [
  {
    id: "wnba_first_square",
    title: "First WNBA Square",
    description: "Purchased your first WNBA Sports Square™",
    emoji: "🟪",
    category: "squares",
  },
  {
    id: "wnba_quarter_queen",
    title: "Quarter Queen",
    description: "Won a quarter on a WNBA board",
    emoji: "👑",
    category: "squares",
  },
  {
    id: "wnba_highlight_moment",
    title: "Highlight Moment",
    description: "Won a WNBA Highlight Square™ reward",
    emoji: "✨",
    category: "squares",
  },
  {
    id: "wnba_season_champion",
    title: "WNBA Season Champion",
    description: "Won a WNBA Pick'em Royale™ season championship",
    emoji: "🏆",
    category: "pickem",
  },
];
