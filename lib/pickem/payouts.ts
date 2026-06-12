import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { upsertPlayerGameStats } from "@/lib/database/services/playerGameStats";
import { getConnectAccountIdForEmail } from "@/lib/database/services/stripeConnect";
import {
  createConnectTransfer,
  isStripeConnectEnabled,
} from "@/lib/stripe/connect";
import {
  PICKEM_WEEKLY_PAYOUT_SPLITS,
} from "@/lib/pickem/config";
import {
  getPickemContestById,
  updatePickemContestPayoutStatus,
} from "@/lib/pickem/db/contests";
import {
  listPickemLeaguesForContest,
  refreshPickemLeaguePlayerCount,
} from "@/lib/pickem/db/leagues";
import { getContestWeeklyStandings } from "@/lib/pickem/db/stats";
import type { PickemContest, PickemSport } from "@/lib/pickem/types";

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
  place: number
): string {
  return `pickem:${contestId}:${leagueId}:${normalizeEmail(email)}:${place}`;
}

/**
 * Rank weekly winners per league and queue payouts when a contest completes.
 */
export async function processPickemWeeklyPayouts(
  contestId: string
): Promise<PickemPayoutResult> {
  const errors: string[] = [];
  const contest = await getPickemContestById(contestId);
  if (!contest) {
    return { contestId, payoutsCreated: 0, payoutsPaid: 0, skipped: true, errors: ["Contest not found"] };
  }

  if (contest.playerCount <= 0) {
    return { contestId, payoutsCreated: 0, payoutsPaid: 0, skipped: true, errors: [] };
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

  let payoutsCreated = 0;
  let payoutsPaid = 0;

  const leagues = await listPickemLeaguesForContest(contestId);
  const targets = leagues.length
    ? leagues
    : [{ id: "global", prizePoolCents: contest.prizePoolCents, leagueNumber: 1 } as const];

  for (const league of targets) {
    const leagueId = typeof league.id === "string" ? league.id : null;
    const prizePool =
      "prizePoolCents" in league ? league.prizePoolCents : contest.prizePoolCents;

    const standings = await getContestWeeklyStandings({
      contestId,
      leagueId: leagueId ?? undefined,
    });

    if (!standings.length) continue;

    const winners = standings.slice(0, PICKEM_WEEKLY_PAYOUT_SPLITS.length);

    for (let i = 0; i < winners.length; i += 1) {
      const place = i + 1;
      const split = PICKEM_WEEKLY_PAYOUT_SPLITS[i] ?? 0;
      const amountCents = Math.round(prizePool * split);
      if (amountCents <= 0) continue;

      const email = winners[i].email;
      const key = payoutIdempotencyKey(
        contestId,
        leagueId ?? "global",
        email,
        place
      );

      const created = await enqueuePickemPayout({
        contestId,
        leagueId,
        email,
        place,
        amountCents,
        idempotencyKey: key,
      });

      if (created) payoutsCreated += 1;

      const paid = await attemptPickemStripePayout({
        contest,
        email,
        amountCents,
        idempotencyKey: key,
      });

      if (paid) payoutsPaid += 1;
      else if (paid === false) {
        errors.push(`Payout queued for ${email} (place ${place})`);
      }
    }

    if (leagueId) {
      await refreshPickemLeaguePlayerCount(leagueId);
    }
  }

  await updatePickemContestPayoutStatus(
    contestId,
    payoutsPaid > 0 || !isStripeConnectEnabled() ? "paid" : "pending"
  );

  return { contestId, payoutsCreated, payoutsPaid, skipped: false, errors };
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
  if (!isStripeConnectEnabled()) return null;

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
    const transfer = await createConnectTransfer({
      amountCents: input.amountCents,
      destinationAccountId: connectAccountId,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        contest_id: input.contest.id,
        email,
        game: "pickem",
      },
    });

    await supabase
      .from("pickem_payouts")
      .update({
        status: "paid",
        stripe_transfer_id: transfer.id,
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
  const { getPickemPlayerStats } = await import("@/lib/pickem/db/stats");
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
      pickemWins: stats.seasonWins,
      pickAccuracyPct: Math.round(stats.pickAccuracyPct * 10),
      perfectWeeks: stats.perfectWeeks,
      seasonChampionships: stats.seasonChampionships,
    },
  });
}

export async function syncPickemProfileStats(
  email: string,
  sport: PickemSport,
  seasonYear: number
): Promise<void> {
  const { getPickemPlayerStats } = await import("@/lib/pickem/db/stats");
  const stats = await getPickemPlayerStats(email, sport, seasonYear);
  const existing = await import("@/lib/database/services/playerGameStats").then(
    (m) => m.getPlayerGameStats(email, "pickem")
  );

  await upsertPlayerGameStats(email, {
    gameType: "pickem",
    wins: stats.seasonWins,
    winningsCents: existing.winningsCents,
    gamesPlayed: stats.weeksPlayed,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    extra: {
      pickemWins: stats.seasonWins,
      pickAccuracyPct: Math.round(stats.pickAccuracyPct * 10),
      perfectWeeks: stats.perfectWeeks,
      seasonChampionships: stats.seasonChampionships,
    },
  });
}
