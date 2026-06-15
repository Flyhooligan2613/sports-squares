import type { PickemSport } from "@/lib/pickem/types";

export function pickemBasePath(sport: PickemSport): string {
  if (sport === "mlb") return "/baseball-pickem";
  if (sport === "soccer") return "/soccer-predictor";
  return "/pickem";
}

export function pickemSportQuery(sport: PickemSport): string {
  if (sport === "mlb") return "sport=mlb";
  if (sport === "soccer") return "sport=soccer";
  return "sport=nfl";
}

export function pickemApiUrl(path: string, sport: PickemSport): string {
  const base = path.startsWith("/") ? path : `/api/pickem/${path}`;
  const qs = pickemSportQuery(sport);
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}

export function pickemSportLabel(sport: PickemSport): string {
  if (sport === "mlb") return "MLB";
  if (sport === "soccer") return "MLS";
  return "NFL";
}

export function pickemAmbientClass(sport: PickemSport): string {
  if (sport === "soccer") return "pickem-ambient-cyan";
  return "pickem-ambient-green";
}
