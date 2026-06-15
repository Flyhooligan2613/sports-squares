/**
 * Executive Directive #001 — Project Legacy
 * Competitive platform language. Single source of truth for player-facing copy.
 * Internal stat keys (e.g. lifetimeWinnings) stay unchanged — use display labels here.
 *
 * @deprecated Prefer importing from `@/lib/platform/language` for new code.
 * This module re-exports the Contest Language Engine™ for backward compatibility.
 */

import {
  CONTEST_CTA_LABELS,
  JOIN_THE_CONTEST_FALLBACK,
} from "@/lib/contestCenter/cta";
import {
  CONTEST_CTAS,
  CONTEST_CENTER,
  CONTEST_TERMS as ENGINE_CONTEST_TERMS,
  getContestLanguage,
} from "@/lib/platform/language";

export const JOIN_THE_CONTEST = JOIN_THE_CONTEST_FALLBACK;

export const PLATFORM_IDENTITY = {
  name: "SquareBoards",
  tagline: "The world's premier competitive sports platform.",
  category: "Competitive Sports Platform",
  mission:
    "Every fan deserves a place to compete, build reputation, and create unforgettable game day memories.",
} as const;

export const PLATFORM_TERMS = {
  joinTheContest: CONTEST_CTAS.joinTheContest,
  contestCenter: CONTEST_CENTER.shortTitle,
  contestCenterTitle: CONTEST_CENTER.shortTitle,
  contestCenterSubtitle: CONTEST_CENTER.subtitle,
  contestCenterTagline: CONTEST_CENTER.tagline,
  contestCenterTagline2: CONTEST_CENTER.tagline2,
  contestCenterTagline3: CONTEST_CENTER.tagline3,
  contestWinnings: ENGINE_CONTEST_TERMS.contestWinnings,
  competitionHistory: ENGINE_CONTEST_TERMS.competitionHistory,
  competitionResults: ENGINE_CONTEST_TERMS.competitionResults,
  competitor: getContestLanguage().player.competitor,
  competitors: getContestLanguage().player.competitors,
  browseContests: CONTEST_CTAS.browseContests,
  browseLiveContests: CONTEST_CTAS.browseLiveContests,
  enterContest: CONTEST_CTAS.enterTheContest,
  findAContest: CONTEST_CTAS.findAContest,
  lifetimeContestWinnings: ENGINE_CONTEST_TERMS.lifetimeContestWinnings,
  totalContestWinnings: ENGINE_CONTEST_TERMS.totalContestWinnings,
  winHistory: ENGINE_CONTEST_TERMS.competitionHistory,
  playersLabel: getContestLanguage().player.competitors,
  userLabel: getContestLanguage().player.competitor,
} as const;

/** Platform Polish Directive #001 — contextual contest CTAs by game mode. */
export const JOIN_CONTEST_BY_GAME = {
  squares: CONTEST_CTA_LABELS["nfl-squares"],
  nflSquares: CONTEST_CTA_LABELS["nfl-squares"],
  pickem: CONTEST_CTA_LABELS["nfl-pickem"],
  survivor: CONTEST_CTA_LABELS["survivor-x"],
  tournamentRoyale: CONTEST_CTA_LABELS["tournament-royale"],
  mlbSquares: CONTEST_CTA_LABELS["mlb-squares"],
  baseballPickem: CONTEST_CTA_LABELS["mlb-pickem"],
  soccerPickem: CONTEST_CTA_LABELS["soccer-pickem"],
  nbaSquares: CONTEST_CTA_LABELS["nba-squares"],
  nhlPickem: CONTEST_CTA_LABELS["nhl-pickem"],
  highlightSquares: CONTEST_CTA_LABELS["highlight-squares"],
  weeklyRewardDrop: CONTEST_CTA_LABELS["weekly-reward-drop"],
  legacy: CONTEST_CTA_LABELS.legacy,
  huddle: CONTEST_CTA_LABELS.huddle,
} as const;

export function joinContestCta(gameLabel: string): string {
  return `${JOIN_THE_CONTEST} · ${gameLabel}`;
}

/** Replace legacy gambling-oriented labels in UI copy. */
export const LEGACY_TERM_MAP: Record<string, string> = {
  "Play Now": JOIN_THE_CONTEST,
  "Play Pick'em": JOIN_CONTEST_BY_GAME.pickem,
  "Browse Boards": PLATFORM_TERMS.browseLiveContests,
  "Browse Live Boards": PLATFORM_TERMS.browseLiveContests,
  "Browse Games": CONTEST_CTAS.browseContests,
  "Action Center": PLATFORM_TERMS.contestCenter,
  "The Action Center": PLATFORM_TERMS.contestCenterTitle,
  "My Winnings": PLATFORM_TERMS.contestWinnings,
  "Win History": PLATFORM_TERMS.competitionHistory,
  History: PLATFORM_TERMS.competitionHistory,
  "Total Winnings": PLATFORM_TERMS.totalContestWinnings,
  "Lifetime Winnings": PLATFORM_TERMS.lifetimeContestWinnings,
  "All-Time Winnings": PLATFORM_TERMS.lifetimeContestWinnings,
  Bettor: PLATFORM_TERMS.competitor,
  Bettors: PLATFORM_TERMS.competitors,
  User: PLATFORM_TERMS.userLabel,
  Player: PLATFORM_TERMS.competitor,
  Winner: getContestLanguage().player.champion,
  Sportsbook: PLATFORM_TERMS.contestCenter,
  "Place Bet": PLATFORM_TERMS.enterContest,
  "Bet History": PLATFORM_TERMS.competitionHistory,
  "Get in the game": JOIN_THE_CONTEST,
  "Play Today's Boards": PLATFORM_TERMS.browseLiveContests,
  Leaderboards: getContestLanguage().community.competitionRankings,
  "Player Hub": getContestLanguage().profile.competitorHub,
  Enter: CONTEST_CTAS.joinTheContest,
  "Submit Entry": CONTEST_CTAS.lockInYourContest,
  "Join Game": CONTEST_CTAS.joinTheContest,
};

export const MANIFESTO_PRINCIPLES = [
  "Every Fan Has A Chance.",
  "There Is No Wait Line.",
  "Protect The Player's Emotion.",
  "Build Moments, Not Features.",
  "Competition Before Transactions.",
  "Reputation Before Revenue.",
  "Trust Before Growth.",
  "Never Leave The Competitor Standing Still.",
] as const;

export const SQUAREBOARDS_TEST = [
  "Does this make competition more exciting?",
  "Does this strengthen community?",
  "Does this reward commitment?",
  "Does this build reputation?",
  "Does this improve the player experience?",
  "Does this create another memorable moment?",
] as const;
