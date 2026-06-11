import type { EspnSport } from "@/lib/types";

const SPORT_LABELS: Record<EspnSport, string> = {
  nfl: "NFL",
  ncaaf: "NCAA Football",
  nba: "NBA",
  ncaab: "NCAA Basketball",
};

export function getSportLabel(sport?: EspnSport): string {
  if (!sport) return "Sports";
  return SPORT_LABELS[sport] ?? "Sports";
}

/** Best-effort display metadata parsed from pool name (UI only). */
export function parsePoolDisplayMeta(poolName: string): {
  gameDate: string;
  kickoffTime: string;
} {
  const dateMatch = poolName.match(
    /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}\b)/i
  );
  const timeMatch = poolName.match(/\b(\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)?)\b/);

  return {
    gameDate: dateMatch?.[1] ?? "Date TBD",
    kickoffTime: timeMatch?.[1] ?? "Kickoff TBD",
  };
}
