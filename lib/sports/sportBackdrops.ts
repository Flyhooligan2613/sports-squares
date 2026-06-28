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
  /** Sport-specific decorative art layer (field lines, diamond, court, etc.) */
  artClass?: string;
}

const SPORT_BACKDROPS: Record<SportBackdropId, SportBackdropConfig> = {
  nfl: {
    id: "nfl",
    label: "NFL",
    imagePath: null,
    accentColor: "#22c55e",
    gradientClass: "sport-backdrop-gradient-nfl",
    patternClass: "sport-backdrop-pattern-field",
    artClass: "sport-backdrop-art-nfl",
  },
  nba: {
    id: "nba",
    label: "NBA",
    imagePath: null,
    accentColor: "#f97316",
    gradientClass: "sport-backdrop-gradient-nba",
    patternClass: "sport-backdrop-pattern-court",
    artClass: "sport-backdrop-art-nba",
  },
  wnba: {
    id: "wnba",
    label: "WNBA",
    imagePath: null,
    accentColor: "#e879f9",
    gradientClass: "sport-backdrop-gradient-wnba",
    patternClass: "sport-backdrop-pattern-court",
    artClass: "sport-backdrop-art-wnba",
  },
  mlb: {
    id: "mlb",
    label: "MLB",
    imagePath: null,
    accentColor: "#38bdf8",
    gradientClass: "sport-backdrop-gradient-mlb",
    patternClass: "sport-backdrop-pattern-field",
    artClass: "sport-backdrop-art-mlb",
  },
  ncaaf: {
    id: "ncaaf",
    label: "NCAA Football",
    imagePath: null,
    accentColor: "#dc2626",
    gradientClass: "sport-backdrop-gradient-ncaaf",
    patternClass: "sport-backdrop-pattern-field",
    artClass: "sport-backdrop-art-ncaaf",
  },
  soccer: {
    id: "soccer",
    label: "Soccer",
    imagePath: null,
    accentColor: "#10b981",
    gradientClass: "sport-backdrop-gradient-soccer",
    patternClass: "sport-backdrop-pattern-pitch",
    artClass: "sport-backdrop-art-soccer",
  },
  football: {
    id: "football",
    label: "Soccer",
    imagePath: null,
    accentColor: "#10b981",
    gradientClass: "sport-backdrop-gradient-soccer",
    patternClass: "sport-backdrop-pattern-pitch",
    artClass: "sport-backdrop-art-soccer",
  },
  nhl: {
    id: "nhl",
    label: "NHL",
    imagePath: null,
    accentColor: "#60a5fa",
    gradientClass: "sport-backdrop-gradient-nhl",
    patternClass: "sport-backdrop-pattern-ice",
    artClass: "sport-backdrop-art-nhl",
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

/** Default backdrop for non-sport platform pages (wallet, profile, game room, etc.) */
export const PLATFORM_DEFAULT_BACKDROP_ID: SportBackdropId = "nfl";

/** Routes that render their own full-page fixed SportBackdrop — skip app-wide layer */
const ROUTES_WITH_OWN_BACKDROP: Array<string | RegExp> = [
  /^\/games\/[^/]+/,
  /^\/pickem(\/|$)/,
  /^\/baseball-pickem(\/|$)/,
  /^\/soccer-predictor(\/|$)/,
  /^\/wnba-pickem(\/|$)/,
  /^\/survivor(\/|$)/,
  /^\/live-arena(\/|$)/,
];

export function shouldSkipAppAmbientBackdrop(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/admin")) return true;
  return ROUTES_WITH_OWN_BACKDROP.some((rule) =>
    typeof rule === "string" ? pathname === rule || pathname.startsWith(`${rule}/`) : rule.test(pathname)
  );
}

/** Resolve sport backdrop for app-wide ambient layer */
export function resolveAppBackdropSportId(
  pathname: string,
  searchParams?: { get(key: string): string | null } | URLSearchParams | null
): SportBackdropId {
  const fromPath = resolveSportBackdropFromPath(pathname, searchParams);
  if (fromPath) return fromPath;

  if (pathname.startsWith("/tournament-royale")) return "ncaaf";
  if (pathname.startsWith("/contest-center") || pathname.startsWith("/contests")) return "nfl";
  if (pathname.startsWith("/game-day") || pathname.startsWith("/live-winners")) return "nfl";
  if (pathname.startsWith("/leaderboards")) return "nfl";
  if (pathname.startsWith("/my-games")) return PLATFORM_DEFAULT_BACKDROP_ID;
  if (pathname === "/" || pathname.startsWith("/home")) return PLATFORM_DEFAULT_BACKDROP_ID;

  return PLATFORM_DEFAULT_BACKDROP_ID;
}

export function pickemSportToBackdropId(sport: string): SportBackdropId {
  return normalizeSportBackdropId(sport) ?? "nfl";
}

export const SPORT_BACKDROP_IDS = Object.keys(SPORT_BACKDROPS) as SportBackdropId[];
