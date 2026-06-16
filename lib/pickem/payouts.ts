import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { upsertPlayerGameStats } from "@/lib/database/services/playerGameStats";
import { getConnectAccountIdForEmail } from "@/lib/database/services/stripeConnect";
import { PaymentEngine } from "@/lib/platform/engines/payment";
import {
  getPickemContestById,
  updatePickemContestPayoutStatus,
} from "@/lib/pickem/db/contests";
import { getPickemLeagueById } from "@/lib/pickem/db/leagues";
import {
  getPickemPlayerStats,
  upsertPickemPlayerStats,
} from "@/lib/pickem/db/stats";
import { getPickemSportConfig } from "@/lib/pickem/config";
import type { PickemContest, PickemSport } from "@/lib/pickem/types";
import type { PodiumCashPayout, PodiumPlacement } from "@/lib/platform/podium/types";

export interface PickemPayoutResult {
  contestId: string;
  payoutsCreated: number;
  payoutsPaid: number;
  skipped: boolean;
  errors: string[];
}

function formatPayoutError(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    return (err as { message: string }).message;
  }
  return fallback;
}

function payoutIdempotencyKey(
  contestId: string,
  leagueId: string,
  email: string,
  place: number = 1
): string {
  return `pickem:${contestId}:${leagueId}:${normalizeEmail(email)}:p${place}`;
}

/**
 * Split prize pool equally among declared winner(s) and trigger Stripe payouts.
 */
export async function processLeagueWinnerPayouts(input: {
  contestId: string;
  leagueId: string;
  winnerEmails: string[];
  amountCentsEach: number;
  splitEqually: boolean;
}): Promise<PickemPayoutResult> {
  const errors: string[] = [];
  const contest = await getPickemContestById(input.contestId);
  if (!contest) {
    return {
      contestId: input.contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: ["Contest not found"],
    };
  }

  if (input.winnerEmails.length === 0 || input.amountCentsEach <= 0) {
    return {
      contestId: input.contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: [],
    };
  }

  let payoutsCreated = 0;
  let payoutsPaid = 0;

  for (const email of input.winnerEmails) {
    const key = payoutIdempotencyKey(input.contestId, input.leagueId, email);

    const created = await enqueuePickemPayout({
      contestId: input.contestId,
      leagueId: input.leagueId,
      email,
      place: 1,
      amountCents: input.amountCentsEach,
      idempotencyKey: key,
    });

    if (created) payoutsCreated += 1;

    const paid = await attemptPickemStripePayout({
      contest,
      email,
      amountCents: input.amountCentsEach,
      idempotencyKey: key,
    });

    if (paid) payoutsPaid += 1;
    else if (paid === false) {
      errors.push(`Payout queued for ${email}`);
    }
  }

  return {
    contestId: input.contestId,
    payoutsCreated,
    payoutsPaid,
    skipped: false,
    errors,
  };
}

/** Process multi-placement podium cash payouts (1st / 2nd). */
export async function processLeaguePodiumPayouts(input: {
  contestId: string;
  leagueId: string;
  payouts: PodiumCashPayout[];
}): Promise<PickemPayoutResult> {
  const errors: string[] = [];
  const contest = await getPickemContestById(input.contestId);
  if (!contest) {
    return {
      contestId: input.contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: ["Contest not found"],
    };
  }

  if (!input.payouts.length) {
    return {
      contestId: input.contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: [],
    };
  }

  let payoutsCreated = 0;
  let payoutsPaid = 0;

  for (const payout of input.payouts) {
    if (payout.amountCents <= 0) continue;

    const key = payoutIdempotencyKey(
      input.contestId,
      input.leagueId,
      payout.email,
      payout.placement
    );

    const created = await enqueuePickemPayout({
      contestId: input.contestId,
      leagueId: input.leagueId,
      email: payout.email,
      place: payout.placement,
      amountCents: payout.amountCents,
      idempotencyKey: key,
    });

    if (created) payoutsCreated += 1;

    const paid = await attemptPickemStripePayout({
      contest,
      email: payout.email,
      amountCents: payout.amountCents,
      idempotencyKey: key,
    });

    if (paid) payoutsPaid += 1;
    else if (paid === false) {
      errors.push(`Payout queued for ${payout.email} (p${payout.placement})`);
    }
  }

  return {
    contestId: input.contestId,
    payoutsCreated,
    payoutsPaid,
    skipped: false,
    errors,
  };
}

/** @deprecated Use processContestResolution — kept for sync compatibility. */
export async function processPickemWeeklyPayouts(
  contestId: string
): Promise<PickemPayoutResult> {
  const contest = await getPickemContestById(contestId);
  if (!contest) {
    return {
      contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: ["Contest not found"],
    };
  }

  if (contest.payoutStatus === "paid" || contest.payoutStatus === "processing") {
    return { contestId, payoutsCreated: 0, payoutsPaid: 0, skipped: true, errors: [] };
  }

  try {
    await updatePickemContestPayoutStatus(contestId, "processing");
  } catch (err) {
    return {
      contestId,
      payoutsCreated: 0,
      payoutsPaid: 0,
      skipped: true,
      errors: [formatPayoutError(err, "Could not start payout processing.")],
    };
  }

  const { processContestResolution } = await import(
    "@/lib/pickem/engine/resolution"
  );
  const result = await processContestResolution(contestId);

  return {
    contestId,
    payoutsCreated: result.winnersDeclared + result.splitsDeclared,
    payoutsPaid: result.winnersDeclared,
    skipped: false,
    errors: result.errors,
  };
}

export async function recordPickemWinStats(input: {
  email: string;
  sport: PickemSport;
  seasonYear: number;
  earningsCents: number;
  tiebreakerWin: boolean;
  weeklyRecord: string;
}): Promise<void> {
  const email = normalizeEmail(input.email);
  const stats = await getPickemPlayerStats(email, input.sport, input.seasonYear);

  const [winsStr] = input.weeklyRecord.split("-");
  const weeklyWins = parseInt(winsStr ?? "0", 10) || 0;
  const isBetterRecord =
    !stats.bestWeeklyRecord ||
    compareRecords(input.weeklyRecord, stats.bestWeeklyRecord) > 0;

  const updated = {
    ...stats,
    lifetimePickemWins: stats.lifetimePickemWins + 1,
    lifetimeEarningsCents: stats.lifetimeEarningsCents + input.earningsCents,
    mondayTiebreakerWins: stats.mondayTiebreakerWins + (input.tiebreakerWin ? 1 : 0),
    bestFinish:
      stats.bestFinish == null ? 1 : Math.min(stats.bestFinish, 1),
    bestWeeklyRecord: isBetterRecord ? input.weeklyRecord : stats.bestWeeklyRecord,
    seasonChampionships: stats.seasonChampionships + 1,
  };

  await upsertPickemPlayerStats(updated);
}

export async function recordPickemPodiumStats(input: {
  email: string;
  sport: PickemSport;
  seasonYear: number;
  earningsCents: number;
  tiebreakerWin: boolean;
  weeklyRecord: string;
  placement: PodiumPlacement;
}): Promise<void> {
  const email = normalizeEmail(input.email);
  const stats = await getPickemPlayerStats(email, input.sport, input.seasonYear);

  const isBetterRecord =
    !stats.bestWeeklyRecord ||
    compareRecords(input.weeklyRecord, stats.bestWeeklyRecord) > 0;

  const updated = {
    ...stats,
    lifetimeEarningsCents: stats.lifetimeEarningsCents + input.earningsCents,
    mondayTiebreakerWins:
      stats.mondayTiebreakerWins + (input.tiebreakerWin ? 1 : 0),
    bestFinish:
      stats.bestFinish == null
        ? input.placement
        : Math.min(stats.bestFinish, input.placement),
    bestWeeklyRecord: isBetterRecord ? input.weeklyRecord : stats.bestWeeklyRecord,
    ...(input.placement === 1
      ? {
          lifetimePickemWins: stats.lifetimePickemWins + 1,
          seasonChampionships: stats.seasonChampionships + 1,
        }
      : {}),
  };

  await upsertPickemPlayerStats(updated);
}

function compareRecords(a: string, b: string): number {
  const [aW, aL] = a.split("-").map((n) => parseInt(n, 10) || 0);
  const [bW, bL] = b.split("-").map((n) => parseInt(n, 10) || 0);
  if (aW !== bW) return aW - bW;
  return bL - aL;
}

async function enqueuePickemPayout(input: {
  contestId: string;
  leagueId: string | null;
  email: string;
  place: number;
  amountCents: number;
  idempotencyKey: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("pickem_payouts").insert({
    contest_id: input.contestId,
    league_id: input.leagueId,
    email: normalizeEmail(input.email),
    place: input.place,
    amount_cents: input.amountCents,
    status: "queued",
    idempotency_key: input.idempotencyKey,
  });

  if (error?.code === "23505") return false;
  if (error) throw error;
  return true;
}

async function attemptPickemStripePayout(input: {
  contest: PickemContest;
  email: string;
  amountCents: number;
  idempotencyKey: string;
}): Promise<boolean | null> {
  if (!PaymentEngine.isConnectEnabled()) return null;

  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);
  const connectAccountId = await getConnectAccountIdForEmail(email);

  if (!connectAccountId) {
    await supabase
      .from("pickem_payouts")
      .update({
        status: "queued",
        updated_at: new Date().toISOString(),
      })
      .eq("idempotency_key", input.idempotencyKey);
    return false;
  }

  try {
    const transfer = await PaymentEngine.createPayout({
      email,
      amountCents: input.amountCents,
      destinationAccountId: connectAccountId,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        contest_id: input.contest.id,
        email,
        game: "pickem",
      },
    });

    if (!transfer.ok || !transfer.providerTransactionId) {
      throw new Error(transfer.error?.message ?? "Payout failed");
    }

    await supabase
      .from("pickem_payouts")
      .update({
        status: "paid",
        stripe_transfer_id: transfer.providerTransactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("idempotency_key", input.idempotencyKey);

    await syncPickemWinningsToPlatformStats(input.email, input.amountCents);
    return true;
  } catch {
    await supabase
      .from("pickem_payouts")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("idempotency_key", input.idempotencyKey);
    return false;
  }
}

export async function syncPickemWinningsToPlatformStats(
  email: string,
  additionalCents: number
): Promise<void> {
  const stats = await getPickemPlayerStats(
    email,
    "nfl",
    new Date().getFullYear()
  );

  const existing = await import("@/lib/database/services/playerGameStats").then(
    (m) => m.getPlayerGameStats(email, "pickem")
  );

  await upsertPlayerGameStats(email, {
    gameType: "pickem",
    wins: stats.seasonWins,
    winningsCents: existing.winningsCents + additionalCents,
    gamesPlayed: stats.weeksPlayed,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    extra: {
      pickemWins: stats.lifetimePickemWins,
      pickAccuracyPct: Math.round(stats.pickAccuracyPct * 10),
      perfectWeeks: stats.perfectWeeks,
      seasonChampionships: stats.seasonChampionships,
      mondayTiebreakerWins: stats.mondayTiebreakerWins,
      lifetimeEarningsCents: stats.lifetimeEarningsCents,
    },
  });
}

export async function syncPickemProfileStats(
  email: string,
  sport: PickemSport,
  seasonYear: number
): Promise<void> {
  const stats = await getPickemPlayerStats(email, sport, seasonYear);
  const config = getPickemSportConfig(sport);
  const gameType = config.platformGameId;
  const existing = await import("@/lib/database/services/playerGameStats").then(
    (m) => m.getPlayerGameStats(email, gameType)
  );

  await upsertPlayerGameStats(email, {
    gameType,
    wins: stats.seasonWins,
    winningsCents: existing.winningsCents,
    gamesPlayed: stats.weeksPlayed,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    extra: {
      ...(sport === "mlb"
        ? { baseballPickemWins: stats.lifetimePickemWins }
        : sport === "soccer"
          ? { soccerPredictionPoints: stats.lifetimePickemWins }
          : { pickemWins: stats.lifetimePickemWins }),
      pickAccuracyPct: Math.round(stats.pickAccuracyPct * 10),
      perfectWeeks: stats.perfectWeeks,
      seasonChampionships: stats.seasonChampionships,
      mondayTiebreakerWins: stats.mondayTiebreakerWins,
      lifetimeEarningsCents: stats.lifetimeEarningsCents,
    },
  });
}

export async function getLeaguePrizePoolCents(leagueId: string): Promise<number> {
  const league = await getPickemLeagueById(leagueId);
  return league?.prizePoolCents ?? 0;
}
