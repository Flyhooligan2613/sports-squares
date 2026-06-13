/** Shared Pick'em platform copy — keep messaging consistent across UI. */

import type { PickemSport } from "@/lib/pickem/types";
import { pickemSportLabel } from "@/lib/pickem/routes";

export const PICKEM_CHAMPIONSHIP_TIEBREAKER_TITLE =
  "SquareBoards Championship Tiebreaker";

export const PICKEM_CHAMPIONSHIP_TIEBREAKER_SUBTITLE =
  "Predict the combined Monday Night Football final score. Closest prediction wins the pool. Equal distance = automatic prize split.";

export const PICKEM_CHAMPIONSHIP_BANNER = "CHAMPIONSHIP TIEBREAKER ACTIVE";

export const PICKEM_AUTO_ENGINE_TAGLINE =
  "Fully automated — no commissioners, no manual scoring, official NFL results only.";

export const PICKEM_CHAMPIONSHIP_CONGRATS =
  "Congratulations! You finished tied for first place. Predict the total combined points scored during Monday Night Football.";

export function pickemLockTerm(sport: PickemSport): string {
  return sport === "mlb" ? "first pitch" : "kickoff";
}

export function pickemLockTermCapitalized(sport: PickemSport): string {
  const term = pickemLockTerm(sport);
  return term.charAt(0).toUpperCase() + term.slice(1);
}

export function pickemLandingHowItWorksTitle(sport: PickemSport): string {
  return sport === "mlb" ? "Baseball pools, reimagined" : "Football pools, reimagined";
}

export function pickemLandingHowItWorksSubtitle(sport: PickemSport): string {
  const league = pickemSportLabel(sport);
  return `Classic pick-the-winner ${league} pools — built for everyone, from casual fans to die-hards.`;
}

export function pickemLandingFeatures(sport: PickemSport) {
  const lock = pickemLockTerm(sport);

  return [
    {
      title: "Pick winners, not spreads",
      description:
        sport === "mlb"
          ? "No run lines, no odds, no fantasy stats. Just choose the team you think wins."
          : "No point spreads, no odds, no fantasy stats. Just choose the team you think wins.",
    },
    {
      title: "Instant saves",
      description: `Tap a team and your pick saves immediately. Edit anytime until ${lock}.`,
    },
    {
      title: sport === "mlb" ? "Live gameday" : "Live game day",
      description:
        "Cards turn green or red as games finish. Track your record and streak in real time.",
    },
    {
      title: "One SquareBoards account",
      description:
        "Same login, wallet, notifications, and profile across every platform game.",
    },
  ];
}

export function pickemGamesRemainingLabel(
  sport: PickemSport,
  gameCount: number,
  remaining: number
): string {
  const league = pickemSportLabel(sport);
  return `${gameCount} ${league} games · ${remaining} picks remaining for you`;
}

export function pickemWeekPicksSubtitle(sport: PickemSport): string {
  return `Tap the team you think wins. Picks save instantly and lock at ${pickemLockTerm(sport)}.`;
}

export function pickemAutoEngineTaglineForSport(sport: PickemSport): string {
  const league = pickemSportLabel(sport);
  return `Fully automated — no commissioners, no manual scoring, official ${league} results only.`;
}

export function pickemChampionshipTiebreakerSubtitle(sport: PickemSport): string {
  if (sport === "mlb") {
    return "Predict the combined Sunday Night Baseball final score. Closest prediction wins the pool. Equal distance = automatic prize split.";
  }
  return PICKEM_CHAMPIONSHIP_TIEBREAKER_SUBTITLE;
}

export function pickemChampionshipCongrats(sport: PickemSport): string {
  if (sport === "mlb") {
    return "Congratulations! You finished tied for first place. Predict the total combined runs scored during Sunday Night Baseball.";
  }
  return PICKEM_CHAMPIONSHIP_CONGRATS;
}

export function pickemTiebreakerMatchupLabel(sport: PickemSport): string {
  return sport === "mlb" ? "Sunday Night matchup" : "Monday Night matchup";
}

export function pickemTiebreakerCombinedLabel(sport: PickemSport): string {
  return sport === "mlb" ? "Combined SNB total runs" : "Combined MNF total points";
}

export function pickemTiebreakerFinalLabel(sport: PickemSport): string {
  return sport === "mlb" ? "Final SNB combined runs" : "Final MNF combined score";
}

export function pickemTiebreakerHistoryLabel(sport: PickemSport): string {
  return sport === "mlb" ? "SNB tiebreaker" : "MNF tiebreaker";
}

export function pickemHallOfFameSubtitle(sport: PickemSport): string {
  const league = pickemSportLabel(sport);
  return `Every ${league} season archived forever — champions, records, and top 100 standings.`;
}

export function pickemHallOfFameEmptyMessage(sport: PickemSport): string {
  if (sport === "mlb") {
    return "Seasons are archived automatically when the World Series completes. Check back after the first full season.";
  }
  return "Seasons are archived automatically when the Super Bowl completes. Check back after the first full season.";
}

export function pickemEntryPaidMessage(sport: PickemSport): string {
  return `You're in. Make your picks before ${pickemLockTerm(sport)} — they lock automatically.`;
}

export function pickemTiebreakerSubmitMessage(sport: PickemSport): string {
  return `Submit your SquareBoards Championship Tiebreaker prediction before ${pickemLockTerm(sport)}.`;
}

export function pickemCountdownLockedMessage(sport: PickemSport): string {
  return `${pickemLockTermCapitalized(sport)} — predictions locked`;
}

export function pickemLandingAccountTagline(sport: PickemSport): string {
  if (sport === "mlb") {
    return "Two flagship games, one account — SquareBoards for luck, MLB Pick'em for prediction.";
  }
  return "Two flagship games, one account — SquareBoards for luck, Pick'em for prediction.";
}
