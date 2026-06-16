import type {
  PodiumCashPayout,
  PodiumCashSplit,
  PodiumPlacement,
  PodiumPlacementResult,
} from "@/lib/platform/podium/types";

function pctToCents(poolCents: number, pct: number): number {
  if (poolCents <= 0 || pct <= 0) return 0;
  return Math.floor((poolCents * pct) / 100);
}

/**
 * Split prize pool by admin/config percentages across podium placements.
 * Tied placements split their tier share equally.
 */
export function calculatePodiumPayouts(input: {
  prizePoolCents: number;
  placements: PodiumPlacementResult[];
  cashSplit: PodiumCashSplit;
}): PodiumCashPayout[] {
  const { prizePoolCents, placements, cashSplit } = input;
  if (prizePoolCents <= 0 || placements.length === 0) return [];

  const pctByPlacement: Record<PodiumPlacement, number> = {
    1: cashSplit.firstPct,
    2: cashSplit.secondPct,
    3: cashSplit.thirdPct,
  };

  const payouts: PodiumCashPayout[] = [];

  for (const placement of [1, 2, 3] as PodiumPlacement[]) {
    const group = placements.filter((p) => p.placement === placement);
    if (!group.length) continue;

    const tierCents = pctToCents(prizePoolCents, pctByPlacement[placement]);
    if (tierCents <= 0) continue;

    const perPlayer = Math.floor(tierCents / group.length);
    if (perPlayer <= 0) continue;

    for (const player of group) {
      payouts.push({
        email: player.email,
        placement,
        amountCents: perPlayer,
        splitCount: group.length,
      });
    }
  }

  return payouts;
}

/** Legacy single-winner: 100% to first-place group (split if tied). */
export function calculateLegacyWinnerPayouts(input: {
  prizePoolCents: number;
  winnerEmails: string[];
}): PodiumCashPayout[] {
  const count = input.winnerEmails.length;
  if (count === 0 || input.prizePoolCents <= 0) return [];

  const perPlayer = Math.floor(input.prizePoolCents / count);
  return input.winnerEmails.map((email) => ({
    email,
    placement: 1 as PodiumPlacement,
    amountCents: perPlayer,
    splitCount: count,
  }));
}
