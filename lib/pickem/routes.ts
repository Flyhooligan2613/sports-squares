import type { PickemSport } from "@/lib/pickem/types";
import { WNBA_PICKEM_BASE_PATH } from "@/lib/wnbaPickem/config";

export function pickemBasePath(sport: PickemSport): string {
  if (sport === "mlb") return "/baseball-pickem";
  if (sport === "soccer") return "/soccer-predictor";
  if (sport === "wnba") return WNBA_PICKEM_BASE_PATH;
  return "/pickem";
}

export function pickemSportQuery(sport: PickemSport): string {
  if (sport === "mlb") return "sport=mlb";
  if (sport === "soccer") return "sport=soccer";
  if (sport === "wnba") return "sport=wnba";
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
  if (sport === "wnba") return "WNBA";
  return "NFL";
}

export function pickemAmbientClass(sport: PickemSport): string {
  if (sport === "soccer") return "pickem-ambient-cyan";
  if (sport === "wnba") return "pickem-ambient-purple";
  return "pickem-ambient-green";
}

export function isWnbaPickemRoute(pathname: string): boolean {
  return pathname === WNBA_PICKEM_BASE_PATH || pathname.startsWith(`${WNBA_PICKEM_BASE_PATH}/`);
}
