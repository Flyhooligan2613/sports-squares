/** WNBA season phases, banners, and daily story hooks — config only (Phase 1 scaffold). */

export type WnbaSeasonPhase =
  | "opening"
  | "all-star"
  | "commissioners-cup"
  | "playoffs"
  | "finals"
  | "off-season";

export interface WnbaSeasonPhaseConfig {
  id: WnbaSeasonPhase;
  themeKey: string;
  bannerHeadline: string;
  bannerCopy: string;
  contestCenterBadge?: string;
  dailyStoryHook?: string;
}

export const WNBA_SEASON_PHASES: WnbaSeasonPhaseConfig[] = [
  {
    id: "opening",
    themeKey: "wnba_opening",
    bannerHeadline: "WNBA Season Is Here",
    bannerCopy:
      "New season, new rivalries. Join WNBA Sports Squares™ and Pick'em Royale™ — compete on every tip-off.",
    contestCenterBadge: "Season Opener",
    dailyStoryHook: "The WNBA season tips off — claim your squares before the first whistle.",
  },
  {
    id: "all-star",
    themeKey: "wnba_all_star",
    bannerHeadline: "All-Star Weekend",
    bannerCopy:
      "Celebrate the league's best. Special boards and community moments across The Huddle™.",
    contestCenterBadge: "All-Star",
    dailyStoryHook: "All-Star weekend brings spotlight moments — don't miss the action.",
  },
  {
    id: "commissioners-cup",
    themeKey: "wnba_commissioners_cup",
    bannerHeadline: "Commissioner's Cup™",
    bannerCopy:
      "In-season tournament energy. Compete for legacy, XP, and Highlight Squares™ on every Cup game.",
    contestCenterBadge: "Commissioner's Cup",
    dailyStoryHook: "Commissioner's Cup games carry extra weight — lock in before tip-off.",
  },
  {
    id: "playoffs",
    themeKey: "wnba_playoffs",
    bannerHeadline: "WNBA Playoffs",
    bannerCopy:
      "Every possession matters. Playoff boards and weekly Pick'em slates — build your legacy.",
    contestCenterBadge: "Playoffs",
    dailyStoryHook: "Playoff intensity is here — compete on every elimination game.",
  },
  {
    id: "finals",
    themeKey: "wnba_finals",
    bannerHeadline: "WNBA Finals",
    bannerCopy:
      "Championship basketball. The biggest boards, the brightest moments, the deepest legacy.",
    contestCenterBadge: "Finals",
    dailyStoryHook: "The Finals are set — own the court on the biggest stage.",
  },
  {
    id: "off-season",
    themeKey: "wnba_off_season",
    bannerHeadline: "WNBA Off-Season",
    bannerCopy:
      "The court rests — your legacy doesn't. Review your season, climb leaderboards, and prepare for tip-off.",
    contestCenterBadge: "Off-Season",
    dailyStoryHook: "Off-season is legacy season — revisit your WNBA competition history.",
  },
];

export const WNBA_OFF_SEASON_COPY = {
  headline: "WNBA Off-Season",
  message:
    "The WNBA season has wrapped. Sports Squares™ boards return when the schedule syncs — review your competition history and climb Pick'em leaderboards in the meantime.",
  returnHint: "The WNBA typically returns in May. We'll light up boards automatically when games are on the schedule.",
} as const;

export const WNBA_CONTEST_CENTER_BANNER = {
  sportKey: "wnba",
  accent: "#e879f9",
  emoji: "🏀",
  phases: WNBA_SEASON_PHASES,
} as const;

export function getWnbaSeasonPhase(id: WnbaSeasonPhase): WnbaSeasonPhaseConfig | undefined {
  return WNBA_SEASON_PHASES.find((phase) => phase.id === id);
}
