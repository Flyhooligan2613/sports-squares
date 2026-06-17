/**
 * Sport backdrop registry — maps sport ids to background assets and accent colors.
 * Drop photos into `public/sports/{id}.jpg` and set `imagePath` to enable lazy-loaded images.
 */

export type SportBackdropId =
  | "nfl"
  | "nba"
  | "wnba"
  | "mlb"
  | "ncaaf"
  | "soccer"
  | "nhl"
  | "football";

export interface SportBackdropConfig {
  id: SportBackdropId;
  label: string;
  /** Path under public/ — null uses CSS gradient placeholder until photos are added */
  imagePath: string | null;
  accentColor: string;
  gradientClass: string;
  patternClass?: string;
}

const SPORT_BACKDROPS: Record<SportBackdropId, SportBackdropConfig> = {
  nfl: {
    id: "nfl",
    label: "NFL",
    imagePath: null,
    accentColor: "#22c55e",
    gradientClass: "sport-backdrop-gradient-nfl",
    patternClass: "sport-backdrop-pattern-field",
  },
  nba: {
    id: "nba",
    label: "NBA",
    imagePath: null,
    accentColor: "#f97316",
    gradientClass: "sport-backdrop-gradient-nba",
    patternClass: "sport-backdrop-pattern-court",
  },
  wnba: {
    id: "wnba",
    label: "WNBA",
    imagePath: null,
    accentColor: "#e879f9",
    gradientClass: "sport-backdrop-gradient-wnba",
    patternClass: "sport-backdrop-pattern-court",
  },
  mlb: {
    id: "mlb",
    label: "MLB",
    imagePath: null,
    accentColor: "#38bdf8",
    gradientClass: "sport-backdrop-gradient-mlb",
    patternClass: "sport-backdrop-pattern-field",
  },
  ncaaf: {
    id: "ncaaf",
    label: "NCAA Football",
    imagePath: null,
    accentColor: "#dc2626",
    gradientClass: "sport-backdrop-gradient-ncaaf",
    patternClass: "sport-backdrop-pattern-field",
  },
  soccer: {
    id: "soccer",
    label: "Soccer",
    imagePath: null,
    accentColor: "#10b981",
    gradientClass: "sport-backdrop-gradient-soccer",
    patternClass: "sport-backdrop-pattern-pitch",
  },
  football: {
    id: "football",
    label: "Soccer",
    imagePath: null,
    accentColor: "#10b981",
    gradientClass: "sport-backdrop-gradient-soccer",
    patternClass: "sport-backdrop-pattern-pitch",
  },
  nhl: {
    id: "nhl",
    label: "NHL",
    imagePath: null,
    accentColor: "#60a5fa",
    gradientClass: "sport-backdrop-gradient-nhl",
    patternClass: "sport-backdrop-pattern-ice",
  },
};

const DEFAULT_BACKDROP = SPORT_BACKDROPS.nfl;

const SPORT_ALIASES: Record<string, SportBackdropId> = {
  football: "soccer",
  mls: "soccer",
};

export function normalizeSportBackdropId(id: string | null | undefined): SportBackdropId | null {
  if (!id) return null;
  const key = id.toLowerCase().trim();
  if (key in SPORT_BACKDROPS) return key as SportBackdropId;
  if (key in SPORT_ALIASES) return SPORT_ALIASES[key];
  return null;
}

export function getSportBackdrop(id: string | null | undefined): SportBackdropConfig {
  const normalized = normalizeSportBackdropId(id);
  return normalized ? SPORT_BACKDROPS[normalized] : DEFAULT_BACKDROP;
}

/** Resolve sport id from URL for hub pages and pick'em routes */
export function resolveSportBackdropFromPath(
  pathname: string,
  searchParams?: { get(key: string): string | null } | URLSearchParams | null
): SportBackdropId | null {
  const gamesMatch = pathname.match(/^\/games\/([^/]+)/);
  if (gamesMatch) return normalizeSportBackdropId(gamesMatch[1]);

  if (pathname === "/baseball-pickem" || pathname.startsWith("/baseball-pickem/")) {
    return "mlb";
  }
  if (pathname === "/soccer-predictor" || pathname.startsWith("/soccer-predictor/")) {
    return "soccer";
  }
  if (pathname === "/wnba-pickem" || pathname.startsWith("/wnba-pickem/")) {
    return "wnba";
  }
  if (pathname === "/pickem" || pathname.startsWith("/pickem/")) {
    const sport = searchParams?.get("sport");
    return normalizeSportBackdropId(sport) ?? "nfl";
  }
  if (pathname === "/survivor" || pathname.startsWith("/survivor/")) {
    const sport = searchParams?.get("sport");
    return normalizeSportBackdropId(sport) ?? "nfl";
  }

  return null;
}

export function pickemSportToBackdropId(sport: string): SportBackdropId {
  return normalizeSportBackdropId(sport) ?? "nfl";
}

export const SPORT_BACKDROP_IDS = Object.keys(SPORT_BACKDROPS) as SportBackdropId[];
