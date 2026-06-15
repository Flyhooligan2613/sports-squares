import { CINDERELLA_METER_MAX } from "@/lib/tournamentRoyale/config";

/** Cinderella Meter™ points for correct upset picks by seed differential. */
export function cinderellaPointsForUpset(winnerSeed: number, loserSeed: number): number {
  if (winnerSeed >= loserSeed) return 0;
  if (winnerSeed >= 13) return 18;
  if (winnerSeed === 12) return 10;
  if (winnerSeed === 11) return 8;
  if (winnerSeed === 10) return 5;
  if (winnerSeed <= 9 && loserSeed <= 4) return 6;
  return 4;
}

export function applyCinderellaMeter(current: number, earned: number): number {
  return Math.min(CINDERELLA_METER_MAX, current + earned);
}

export function cinderellaTierLabel(meter: number): string {
  if (meter >= 80) return "Legendary Cinderella";
  if (meter >= 50) return "Bracket Believer";
  if (meter >= 25) return "Upset Watcher";
  if (meter > 0) return "Cinderella Rising";
  return "Ready for magic";
}
