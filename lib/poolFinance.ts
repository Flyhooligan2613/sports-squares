import { getScoringPeriods } from "@/lib/espn/sports";
import { resolvePoolHostingFeePercent } from "@/lib/platform/core/platformFeeSchedule";
import { resolvePoolPayoutPercentages } from "@/lib/payoutTemplates";
import type {
  Participant,
  PaymentStatus,
  PayoutPercentages,
  Pool,
  PayoutStatus,
  PoolSummary,
  ScoringPeriod,
  WinnerHistory,
  WinnerResult,
} from "./types";

export function calcAmountDue(
  allocatedCredits: number,
  costPerSquare: number
): number {
  return roundMoney(allocatedCredits * costPerSquare);
}

/** Sum of credits allocated to all players (payment basis — not claimed squares). */
export function calcTotalAllocatedCredits(pool: Pool): number {
  return pool.participants.reduce(
    (sum, player) => sum + (player.creditsPurchased ?? 0),
    0
  );
}

export function calcPoolSummary(pool: Pool): PoolSummary {
  const costPerSquare = pool.costPerSquare ?? 0;
  const serviceFeePercent = resolvePoolHostingFeePercent({
    entryTierCents: pool.entryTierCents,
    costPerSquare: pool.costPerSquare,
  });
  const allocatedCredits = calcTotalAllocatedCredits(pool);
  const totalRevenue = roundMoney(allocatedCredits * costPerSquare);
  const serviceFee = roundMoney(totalRevenue * (serviceFeePercent / 100));
  const prizePool = roundMoney(totalRevenue - serviceFee);

  return { allocatedCredits, totalRevenue, serviceFee, prizePool };
}

export function calcPeriodPayouts(
  prizePool: number,
  scoringPeriods: ScoringPeriod[],
  percentages?: PayoutPercentages
): Partial<Record<ScoringPeriod, number>> {
  if (prizePool <= 0 || scoringPeriods.length === 0) return {};
  if (!percentages) return {};

  const payouts: Partial<Record<ScoringPeriod, number>> = {};
  let allocated = 0;

  for (let i = 0; i < scoringPeriods.length; i++) {
    const period = scoringPeriods[i];
    const pct = percentages[period] ?? 0;

    if (i === scoringPeriods.length - 1) {
      payouts[period] = roundMoney(prizePool - allocated);
    } else {
      const amount = roundMoney(prizePool * (pct / 100));
      payouts[period] = amount;
      allocated += amount;
    }
  }

  return payouts;
}

export function calcPeriodPayoutsForPool(
  pool: Pool,
  scoringPeriods?: ScoringPeriod[]
): Partial<Record<ScoringPeriod, number>> {
  const periods = scoringPeriods ?? getScoringPeriods(pool.espnSport);
  const summary = calcPoolSummary(pool);
  const percentages = resolvePoolPayoutPercentages(pool);
  return calcPeriodPayouts(summary.prizePool, periods, percentages);
}

export function enrichParticipantFinancials(
  participant: Participant,
  pool: Pool
): Participant {
  const costPerSquare = pool.costPerSquare ?? 0;
  const amountDue = calcAmountDue(participant.creditsPurchased, costPerSquare);
  const amountPaid = participant.amountPaid ?? 0;
  const paymentStatus =
    participant.paymentStatus ??
    derivePaymentStatus(amountDue, amountPaid);

  return {
    ...participant,
    amountDue,
    amountPaid,
    paymentStatus,
  };
}

export function derivePaymentStatus(
  amountDue: number,
  amountPaid: number
): PaymentStatus {
  if (amountDue <= 0) return amountPaid > 0 ? "paid" : "unpaid";
  if (amountPaid >= amountDue) return "paid";
  if (amountPaid > 0) return "partial";
  return "unpaid";
}

export function attachPayoutToWinner(
  result: WinnerResult,
  pool: Pool,
  scoringPeriods?: ScoringPeriod[]
): WinnerResult {
  const periods = scoringPeriods ?? getScoringPeriods(pool.espnSport);
  const summary = calcPoolSummary(pool);
  const percentages = resolvePoolPayoutPercentages(pool);
  const payouts = calcPeriodPayouts(summary.prizePool, periods, percentages);
  const payoutAmount = payouts[result.quarter] ?? result.payoutAmount ?? null;

  return {
    ...result,
    payoutAmount: payoutAmount ?? null,
    payoutStatus: result.payoutStatus ?? "pending",
  };
}

export function applyPayoutsToHistory(
  history: WinnerHistory,
  pool: Pool,
  scoringPeriods?: ScoringPeriod[]
): WinnerHistory {
  const periods = scoringPeriods ?? getScoringPeriods(pool.espnSport);
  const summary = calcPoolSummary(pool);
  const percentages = resolvePoolPayoutPercentages(pool);
  const payouts = calcPeriodPayouts(summary.prizePool, periods, percentages);
  const next: WinnerHistory = {};

  for (const [period, winner] of Object.entries(history)) {
    if (!winner) continue;
    next[period as ScoringPeriod] = {
      ...winner,
      payoutAmount: payouts[period as ScoringPeriod] ?? winner.payoutAmount ?? null,
      payoutStatus: winner.payoutStatus ?? "pending",
    };
  }

  return next;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function poolHasFinancials(pool: Pool): boolean {
  return (pool.costPerSquare ?? 0) > 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
