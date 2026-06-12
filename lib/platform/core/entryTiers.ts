/**
 * Platform-wide entry buy-in tiers (cents).
 * Future games inherit these automatically via game registry.
 */

export type EntryTierGroup = "beginner" | "casual" | "premium";

export interface EntryTier {
  cents: number;
  label: string;
  group: EntryTierGroup;
}

export const ENTRY_TIER_GROUPS: Record<
  EntryTierGroup,
  { label: string; description: string }
> = {
  beginner: {
    label: "Beginner",
    description: "Low-stakes fun — perfect for first-time players.",
  },
  casual: {
    label: "Casual",
    description: "Mid-tier contests for regular players.",
  },
  premium: {
    label: "Premium",
    description: "High-stakes boards and prize pools.",
  },
};

export const PLATFORM_ENTRY_TIERS: EntryTier[] = [
  { cents: 100, label: "$1", group: "beginner" },
  { cents: 200, label: "$2", group: "beginner" },
  { cents: 300, label: "$3", group: "beginner" },
  { cents: 500, label: "$5", group: "beginner" },
  { cents: 1000, label: "$10", group: "casual" },
  { cents: 2000, label: "$20", group: "casual" },
  { cents: 2500, label: "$25", group: "casual" },
  { cents: 5000, label: "$50", group: "premium" },
  { cents: 10000, label: "$100", group: "premium" },
];

/** Future high-roller tiers — architected but hidden until launch. */
export const HIGH_ROLLER_ENTRY_TIERS: EntryTier[] = [
  { cents: 25000, label: "$250", group: "premium" },
  { cents: 50000, label: "$500", group: "premium" },
  { cents: 100000, label: "$1,000", group: "premium" },
];

export const HIGH_ROLLER_ENABLED = false;

/** All tiers including high roller when enabled. */
export function getActiveEntryTiers(): EntryTier[] {
  return HIGH_ROLLER_ENABLED
    ? [...PLATFORM_ENTRY_TIERS, ...HIGH_ROLLER_ENTRY_TIERS]
    : PLATFORM_ENTRY_TIERS;
}

export function formatTierCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function getTiersByGroup(group: EntryTierGroup): EntryTier[] {
  return getActiveEntryTiers().filter((t) => t.group === group);
}

export function getTierByCents(cents: number): EntryTier | undefined {
  return getActiveEntryTiers().find((t) => t.cents === cents);
}

/** Square price in dollars (pools.cost_per_square) from tier cents. */
export function tierCentsToCostPerSquare(cents: number): number {
  return cents / 100;
}

/** Legacy boards without entry_tier_cents default to $10. */
export function normalizeEntryTierCents(cents: number | null | undefined): number {
  return cents ?? 1000;
}

export function isValidEntryTierCents(cents: number): boolean {
  return getActiveEntryTiers().some((t) => t.cents === cents);
}

export function parseEntryTierParam(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (isValidEntryTierCents(parsed)) return parsed;
  return 1000;
}

export const SQUARES_ENTRY_TIERS = PLATFORM_ENTRY_TIERS;
export const PICKEM_ENTRY_TIERS = PLATFORM_ENTRY_TIERS;
