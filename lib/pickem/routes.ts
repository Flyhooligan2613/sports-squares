import type { PickemSport } from "@/lib/pickem/types";

export function pickemBasePath(sport: PickemSport): string {
  return sport === "mlb" ? "/baseball-pickem" : "/pickem";
}

export function pickemSportQuery(sport: PickemSport): string {
  return sport === "mlb" ? "sport=mlb" : "sport=nfl";
}

export function pickemApiUrl(path: string, sport: PickemSport): string {
  const base = path.startsWith("/") ? path : `/api/pickem/${path}`;
  const qs = pickemSportQuery(sport);
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

export function pickemSportLabel(sport: PickemSport): string {
  return sport === "mlb" ? "MLB" : "NFL";
}
