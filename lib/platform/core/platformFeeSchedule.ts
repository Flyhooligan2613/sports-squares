/**
 * Fixed platform hosting fee schedule — code-defined only.
 * Administrators cannot override entry prices or hosting percentages.
 *
 * SquareBoards earns a hosting fee for running automated games, scoring,
 * prize pools, and Stripe Connect payouts. Players are never wagering
 * against the platform on Pick'em lines (skill competition) or Survivor;
 * squares are lottery-style number draws among participants.
 */

import { creditGrowthFund } from "@/lib/platform/core/growthFund";
import {
  getActiveEntryTiers,
  normalizeEntryTierCents,
  type EntryTier,
} from "@/lib/platform/core/entryTiers";

export type PlatformProductType = "squares" | "pickem" | "bracket" | "survivor";

export interface PlatformHostingFeeBand {
  /** Inclusive upper bound for this band (entry tier cents). */
  throughCents: number;
  hostingFeePercent: number;
  label: string;
}

/** Locked hosting rates by buy-in tier — same across all sports and game modes. */
export const PLATFORM_HOSTING_FEE_BANDS: readonly PlatformHostingFeeBand[] = [
  { throughCents: 500, hostingFeePercent: 15, label: "$1–$5" },
  { throughCents: 2500, hostingFeePercent: 12, label: "$10–$25" },
  { throughCents: Number.POSITIVE_INFINITY, hostingFeePercent: 10, label: "$50+" },
] as const;

export const PLATFORM_PRICING_LOCKED =
  "Entry prices and hosting fees are fixed in platform code. No administrator, host, or commissioner can change them.";

export const PLATFORM_MODEL = {
  pickem:
    "Pick'em is a global skill competition — predict winners, climb standings, and compete with players worldwide. You are not wagering against SquareBoards or other players; entry fees fund tier prize pools.",
  squares:
    "Squares is a lottery-style game among participants. Random digits assign squares; winners are determined by official scores. You are not betting against the platform.",
  survivor:
    "Survivor is a season-long competition — one pick per week, last player standing wins. Entry fees fund the league prize pool.",
  bracket:
    "Bracket contests are prediction competitions. Entry fees fund the tournament prize pool.",
  hosting:
    "SquareBoards charges a fixed hosting percentage on every paid entry to operate automation, official scoring, prize pools, and mandatory Stripe Connect cash-outs for winners.",
  connect:
    "Winners must connect a Stripe cash-out account so automated payouts can be sent directly — SquareBoards never holds player balances.",
} as const;

export function resolvePlatformHostingFeePercent(
  entryTierCents: number,
  _productType: PlatformProductType = "squares"
): number {
  const cents = normalizeEntryTierCents(entryTierCents);
  for (const band of PLATFORM_HOSTING_FEE_BANDS) {
    if (cents <= band.throughCents) return band.hostingFeePercent;
  }
  return 10;
}

export function resolvePoolHostingFeePercent(pool: {
  entryTierCents?: number | null;
  costPerSquare?: number | null;
}): number {
  const tierCents =
    pool.entryTierCents != null
      ? normalizeEntryTierCents(pool.entryTierCents)
      : Math.round((pool.costPerSquare ?? 0) * 100);
  if (tierCents <= 0) return 0;
  return resolvePlatformHostingFeePercent(tierCents, "squares");
}

export function calcPlatformHostingFeeCents(
  grossCents: number,
  entryTierCents: number,
  productType: PlatformProductType = "squares"
): number {
  if (grossCents <= 0) return 0;
  const pct = resolvePlatformHostingFeePercent(entryTierCents, productType);
  return Math.round(grossCents * (pct / 100));
}

export function calcPrizePoolCreditCents(
  grossCents: number,
  entryTierCents: number,
  productType: PlatformProductType = "squares"
): number {
  return grossCents - calcPlatformHostingFeeCents(grossCents, entryTierCents, productType);
}

export function formatHostingFeePercent(entryTierCents: number): string {
  return `${resolvePlatformHostingFeePercent(entryTierCents)}%`;
}

export function getHostingFeeBandForTier(entryTierCents: number): PlatformHostingFeeBand {
  const cents = normalizeEntryTierCents(entryTierCents);
  for (const band of PLATFORM_HOSTING_FEE_BANDS) {
    if (cents <= band.throughCents) return band;
  }
  return PLATFORM_HOSTING_FEE_BANDS[PLATFORM_HOSTING_FEE_BANDS.length - 1];
}

export interface TierFeeScheduleRow {
  tier: EntryTier;
  hostingFeePercent: number;
  prizePoolPercent: number;
}

export function getTierFeeSchedule(): TierFeeScheduleRow[] {
  return getActiveEntryTiers().map((tier) => {
    const hostingFeePercent = resolvePlatformHostingFeePercent(tier.cents);
    return {
      tier,
      hostingFeePercent,
      prizePoolPercent: 100 - hostingFeePercent,
    };
  });
}

export async function recordPlatformHostingFee(input: {
  amountCents: number;
  productType: PlatformProductType;
  sourceId?: string;
  description: string;
}): Promise<void> {
  if (input.amountCents <= 0) return;
  await creditGrowthFund({
    amountCents: input.amountCents,
    sourceType: `hosting_fee_${input.productType}`,
    sourceId: input.sourceId,
    description: input.description,
  });
}
