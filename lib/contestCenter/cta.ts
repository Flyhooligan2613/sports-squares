import type { ContestKind, ContestListing, ContestStatus } from "@/lib/contestCenter/types";
import { CONTEST_CTAS, CONTEST_STATUS_LABELS } from "@/lib/platform/language";

/** Fallback when no contest context is available. */
export const JOIN_THE_CONTEST_FALLBACK = CONTEST_CTAS.joinTheContest;

export type ContestCtaKey =
  | "nfl-squares"
  | "nfl-pickem"
  | "survivor-x"
  | "mlb-squares"
  | "mlb-pickem"
  | "nba-squares"
  | "tournament-royale"
  | "nhl-pickem"
  | "soccer-pickem"
  | "highlight-squares"
  | "weekly-reward-drop"
  | "legacy"
  | "huddle";

export type FeaturedCtaPreset =
  | "compete_for_glory"
  | "enter_today"
  | "claim_spot"
  | "compete_now"
  | "join_championship";

/** Platform Polish Directive #001 — sport-specific invitation copy. */
export const CONTEST_CTA_LABELS: Record<ContestCtaKey, string> = {
  "nfl-squares": "Join Sunday's Contest",
  "nfl-pickem": "Make Your Picks",
  "survivor-x": "Survive This Week",
  "mlb-squares": "Claim Your Diamond",
  "mlb-pickem": "Step Up to the Plate",
  "nba-squares": "Own the Court",
  "tournament-royale": "Enter the Tournament",
  "nhl-pickem": "Drop the Puck",
  "soccer-pickem": "Kick Off the Match",
  "highlight-squares": "Activate the Challenge",
  "weekly-reward-drop": "Open Your Reward",
  legacy: "Continue Your Legacy",
  huddle: "Join the Community",
};

export const FEATURED_CTA_LABELS: Record<FeaturedCtaPreset, string> = {
  compete_for_glory: "Compete for Glory",
  enter_today: "Enter Today's Challenge",
  claim_spot: "Claim Your Spot",
  compete_now: "Compete Now",
  join_championship: "Join the Championship",
};

export const FEATURED_CTA_PRESET_OPTIONS = Object.entries(FEATURED_CTA_LABELS).map(
  ([value, label]) => ({ value: value as FeaturedCtaPreset, label })
);

export const TEMPLATE_CTA_KEY: Record<string, ContestCtaKey> = {
  "nfl-squares": "nfl-squares",
  "nfl-pickem": "nfl-pickem",
  "survivor-x": "survivor-x",
  "mlb-squares": "mlb-squares",
  "mlb-pickem": "mlb-pickem",
  "nba-squares": "nba-squares",
  "tournament-royale": "tournament-royale",
  "soccer-pickem": "soccer-pickem",
  "nhl-pickem": "nhl-pickem",
};

export const ECOSYSTEM_CTA_KEY: Record<string, ContestCtaKey> = {
  squareboards: "nfl-squares",
  "nba-squares": "nba-squares",
  "mlb-squares": "mlb-squares",
  pickem: "nfl-pickem",
  "baseball-pickem": "mlb-pickem",
  survivor: "survivor-x",
  brackets: "tournament-royale",
  "soccer-predictor": "soccer-pickem",
  "weekly-rewards": "weekly-reward-drop",
  achievements: "legacy",
  "player-profiles": "legacy",
  huddle: "huddle",
};

/** Admin-editable contest CTA metadata (stored in ecosystem_admin_config). */
export interface ContestCtaAdminConfig {
  overrides: Partial<Record<ContestCtaKey | string, string>>;
  featured: Partial<Record<FeaturedCtaPreset, string>>;
  defaultFeaturedPreset: FeaturedCtaPreset;
}

export const DEFAULT_CONTEST_CTA_CONFIG: ContestCtaAdminConfig = {
  overrides: {},
  featured: {},
  defaultFeaturedPreset: "compete_for_glory",
};

export interface ResolveContestCtaInput {
  ctaKey?: ContestCtaKey | string;
  ctaLabel?: string | null;
  templateId?: string;
  sportKey?: string;
  kind?: ContestKind;
  featured?: boolean;
  featuredCtaPreset?: FeaturedCtaPreset | null;
  status?: ContestStatus;
  adminConfig?: ContestCtaAdminConfig | null;
}

function normalizeSportKey(sport?: string): string {
  return (sport ?? "").trim().toLowerCase();
}

function resolveCtaKey(input: ResolveContestCtaInput): ContestCtaKey | null {
  if (input.ctaKey && input.ctaKey in CONTEST_CTA_LABELS) {
    return input.ctaKey as ContestCtaKey;
  }

  if (input.templateId && TEMPLATE_CTA_KEY[input.templateId]) {
    return TEMPLATE_CTA_KEY[input.templateId];
  }

  const sport = normalizeSportKey(input.sportKey);

  if (input.kind === "squares") {
    if (sport === "nfl" || sport === "football") return "nfl-squares";
    if (sport === "mlb" || sport === "baseball") return "mlb-squares";
    if (sport === "nba" || sport === "basketball") return "nba-squares";
    return "nfl-squares";
  }

  if (input.kind === "pickem") {
    if (sport === "nfl" || sport === "football") return "nfl-pickem";
    if (sport === "mlb" || sport === "baseball") return "mlb-pickem";
    if (sport === "nhl" || sport === "hockey") return "nhl-pickem";
    if (sport === "soccer" || sport === "football") return "soccer-pickem";
    return "nfl-pickem";
  }

  if (input.kind === "survivor") return "survivor-x";
  if (input.kind === "tournament") return "tournament-royale";

  return null;
}

export function resolveContestCta(input: ResolveContestCtaInput): string {
  if (input.status === "coming_soon") return CONTEST_STATUS_LABELS.coming_soon;

  const explicit = input.ctaLabel?.trim();
  if (explicit) return explicit;

  const admin = input.adminConfig ?? DEFAULT_CONTEST_CTA_CONFIG;

  if (input.featured) {
    const preset =
      input.featuredCtaPreset ?? admin.defaultFeaturedPreset ?? "compete_for_glory";
    const featuredLabel = admin.featured[preset] ?? FEATURED_CTA_LABELS[preset];
    if (featuredLabel) return featuredLabel;
  }

  const key = resolveCtaKey(input);
  if (key) {
    const override = admin.overrides[key];
    if (override?.trim()) return override.trim();
    return CONTEST_CTA_LABELS[key];
  }

  return JOIN_THE_CONTEST_FALLBACK;
}

export function resolveContestCtaFromListing(
  contest: ContestListing,
  options: {
    featured?: boolean;
    adminConfig?: ContestCtaAdminConfig | null;
  } = {}
): string {
  const isCatalogTemplate =
    !contest.id.startsWith("board-") &&
    !contest.id.startsWith("live-") &&
    !contest.id.startsWith("rec-");

  return resolveContestCta({
    ctaKey: contest.ctaKey,
    ctaLabel: contest.ctaLabel,
    templateId: isCatalogTemplate ? contest.id : undefined,
    sportKey: contest.sportKey,
    kind: contest.kind,
    featured: options.featured ?? contest.featured,
    featuredCtaPreset: contest.featuredCtaPreset,
    status: contest.status,
    adminConfig: options.adminConfig,
  });
}

export function resolveEcosystemFeatureCta(featureId: string): string {
  const key = ECOSYSTEM_CTA_KEY[featureId];
  if (key) return CONTEST_CTA_LABELS[key];
  return JOIN_THE_CONTEST_FALLBACK;
}

export function resolveSquaresBoardCta(
  sport: string,
  adminConfig?: ContestCtaAdminConfig | null
): string {
  return resolveContestCta({
    kind: "squares",
    sportKey: sport,
    adminConfig,
  });
}

export function resolveFeaturedContestCta(
  contest: ContestListing,
  adminConfig?: ContestCtaAdminConfig | null
): string {
  return resolveContestCtaFromListing(contest, { featured: true, adminConfig });
}
