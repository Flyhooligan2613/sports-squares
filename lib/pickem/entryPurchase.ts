import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  assignPlayerToPickemLeague,
  refreshPickemLeaguePlayerCount,
} from "@/lib/pickem/db/leagues";
import { getPickemContestById } from "@/lib/pickem/db/contests";
import { isValidEntryTierCents } from "@/lib/platform/core/entryTiers";
import {
  calcPrizePoolCreditCents,
  calcPlatformHostingFeeCents,
  recordPlatformHostingFee,
} from "@/lib/platform/core/platformFeeSchedule";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { displayNameFromEmail } from "@/lib/player/statsCore";

const TABLE = "pickem_entry_purchases";

export type PickemEntryPurchaseStatus = "pending" | "paid" | "refunded" | "failed";

export interface PickemEntryPurchase {
  id: string;
  contestId: string;
  leagueId: string | null;
  email: string;
  entryTierCents: number;
  amountCents: number;
  status: PickemEntryPurchaseStatus;
  stripeCheckoutSessionId: string;
}

function mapRow(row: Record<string, unknown>): PickemEntryPurchase {
  return {
    id: row.id as string,
    contestId: row.contest_id as string,
    leagueId: (row.league_id as string | null) ?? null,
    email: row.email as string,
    entryTierCents: row.entry_tier_cents as number,
    amountCents: row.amount_cents as number,
    status: row.status as PickemEntryPurchaseStatus,
    stripeCheckoutSessionId: row.stripe_checkout_session_id as string,
  };
}

export async function hasPickemEntryForContest(input: {
  contestId: string;
  email: string;
  entryTierCents: number;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id")
    .eq("contest_id", input.contestId)
    .eq("email", normalizeEmail(input.email))
    .eq("entry_tier_cents", input.entryTierCents)
    .eq("status", "paid")
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function getPickemEntryPurchaseBySession(
  sessionId: string
): Promise<PickemEntryPurchase | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function reservePickemEntryPurchase(input: {
  contestId: string;
  email: string;
  entryTierCents: number;
  amountCents: number;
  sessionId: string;
  paymentIntentId?: string | null;
}): Promise<PickemEntryPurchase> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);

  const existing = await getPickemEntryPurchaseBySession(input.sessionId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      contest_id: input.contestId,
      email,
      entry_tier_cents: input.entryTierCents,
      amount_cents: input.amountCents,
      stripe_checkout_session_id: input.sessionId,
      stripe_payment_intent_id: input.paymentIntentId ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error?.code === "23505") {
    const raced = await getPickemEntryPurchaseBySession(input.sessionId);
    if (raced) return raced;

    const { data: paidRow } = await supabase
      .from(TABLE)
      .select("*")
      .eq("contest_id", input.contestId)
      .eq("email", email)
      .eq("entry_tier_cents", input.entryTierCents)
      .maybeSingle();

    if (paidRow) return mapRow(paidRow as Record<string, unknown>);
    throw error;
  }

  if (error) throw error;
  return mapRow(data as Record<string, unknown>);
}

export async function fulfillPickemEntryPurchase(input: {
  contestId: string;
  email: string;
  entryTierCents: number;
  stripeCheckoutSessionId: string;
  amountPaidCents: number;
  stripePaymentIntentId?: string | null;
}): Promise<{ leagueId: string; alreadyFulfilled: boolean }> {
  const email = normalizeEmail(input.email);
  const entryTierCents = isValidEntryTierCents(input.entryTierCents)
    ? input.entryTierCents
    : 1000;

  const expectedCents = entryTierCents;
  if (input.amountPaidCents !== expectedCents) {
    throw new Error("Payment amount does not match entry tier price.");
  }

  const contest = await getPickemContestById(input.contestId);
  if (!contest) throw new Error("Contest not found.");
  if (contest.status === "complete") {
    throw new Error("This contest is already complete.");
  }

  const existingPaid = await hasPickemEntryForContest({
    contestId: input.contestId,
    email,
    entryTierCents,
  });
  if (existingPaid) {
    const row = await getPickemEntryPurchaseBySession(input.stripeCheckoutSessionId);
    return { leagueId: row?.leagueId ?? "", alreadyFulfilled: true };
  }

  await reservePickemEntryPurchase({
    contestId: input.contestId,
    email,
    entryTierCents,
    amountCents: input.amountPaidCents,
    sessionId: input.stripeCheckoutSessionId,
    paymentIntentId: input.stripePaymentIntentId,
  });

  await ensurePlayerProfile(email, displayNameFromEmail(email));

  const league = await assignPlayerToPickemLeague(contest, email, entryTierCents);
  await refreshPickemLeaguePlayerCount(league.id);

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from(TABLE)
    .update({
      status: "paid",
      league_id: league.id,
      fulfilled_at: now,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      amount_cents: input.amountPaidCents,
    })
    .eq("stripe_checkout_session_id", input.stripeCheckoutSessionId);

  if (updateError) throw updateError;

  const hostingFeeCents = calcPlatformHostingFeeCents(
    input.amountPaidCents,
    entryTierCents,
    "pickem"
  );
  const prizePoolCreditCents = calcPrizePoolCreditCents(
    input.amountPaidCents,
    entryTierCents,
    "pickem"
  );

  await supabase
    .from("pickem_leagues")
    .update({
      prize_pool_cents: league.prizePoolCents + prizePoolCreditCents,
      updated_at: now,
    })
    .eq("id", league.id);

  await recordPlatformHostingFee({
    amountCents: hostingFeeCents,
    productType: "pickem",
    sourceId: league.id,
    description: `Pick'em hosting · ${contest.label} · ${entryTierCents / 100}`,
  }).catch(() => undefined);

  await logPlatformAudit({
    eventType: "pickem.entry_paid",
    summary: `Pick'em entry paid — ${contest.label} @ ${entryTierCents / 100}`,
    gameType: "pickem",
    entityType: "pickem_contest",
    entityId: input.contestId,
    actorEmail: email,
    actorRole: "player",
    metadata: { entryTierCents, leagueId: league.id, amountCents: input.amountPaidCents },
  });

  const { recordQualifiedGameplay } = await import("@/lib/platform/ecosystem/gameplay");
  await recordQualifiedGameplay({
    email,
    gameType: "pickem",
    amountCents: input.amountPaidCents,
    isDeposit: input.amountPaidCents >= 2500,
  }).catch(() => undefined);

  return { leagueId: league.id, alreadyFulfilled: false };
}

export async function reversePickemEntryBySession(
  sessionId: string
): Promise<{ reversed: boolean }> {
  const supabase = getSupabaseAdmin();
  const row = await getPickemEntryPurchaseBySession(sessionId);
  if (!row || row.status === "refunded") return { reversed: Boolean(row) };

  await supabase
    .from(TABLE)
    .update({ status: "refunded" })
    .eq("stripe_checkout_session_id", sessionId);

  return { reversed: true };
}

export function pickemEntryAmountCents(entryTierCents: number): number {
  return entryTierCents;
}
