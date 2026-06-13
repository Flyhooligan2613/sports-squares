import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { getAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { syncTierForAccount } from "@/lib/platform/ecosystem/tiers";
import { ensureEcosystemAccount, updateEcosystemProfile } from "@/lib/platform/ecosystem/account";
import type { CreditKind } from "@/lib/platform/ecosystem/types";

function isoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function appendLedger(input: {
  email: string;
  entryType: "earn" | "spend";
  creditKind: CreditKind;
  amount: number;
  source: string;
  gameType?: string;
  metadata?: Record<string, unknown>;
  balanceAfter?: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("player_credit_ledger").insert({
    email: normalizeEmail(input.email),
    entry_type: input.entryType,
    credit_kind: input.creditKind,
    amount: input.amount,
    balance_after: input.balanceAfter ?? null,
    source: input.source,
    game_type: input.gameType ?? null,
    metadata: input.metadata ?? {},
  });
}

export async function earnTierCredits(input: {
  email: string;
  amount: number;
  source: string;
  gameType?: string;
  metadata?: Record<string, unknown>;
}): Promise<number> {
  if (input.amount <= 0) return 0;

  const account = await ensureEcosystemAccount(input.email);
  const lifetime = account.lifetimeTierCredits + input.amount;
  const available = account.availableTierCredits + input.amount;
  const weekKey = isoWeekKey();
  const weeklyCredits =
    account.weeklyPeriodKey === weekKey
      ? account.weeklyTierCredits + input.amount
      : input.amount;

  await updateEcosystemProfile(input.email, {
    lifetime_tier_credits: lifetime,
    available_tier_credits: available,
    weekly_tier_credits: weeklyCredits,
    weekly_period_key: weekKey,
  });

  await syncTierForAccount(normalizeEmail(input.email), lifetime);
  await appendLedger({
    email: input.email,
    entryType: "earn",
    creditKind: "tier",
    amount: input.amount,
    source: input.source,
    gameType: input.gameType,
    metadata: input.metadata,
    balanceAfter: available,
  });

  return available;
}

export async function spendTierCredits(input: {
  email: string;
  amount: number;
  source: string;
  metadata?: Record<string, unknown>;
}): Promise<number> {
  const account = await ensureEcosystemAccount(input.email);
  if (account.availableTierCredits < input.amount) {
    throw new Error("Insufficient Tier Credits.");
  }

  const available = account.availableTierCredits - input.amount;
  await updateEcosystemProfile(input.email, {
    available_tier_credits: available,
    rewards_redeemed: account.rewardsRedeemed + 1,
  });

  await appendLedger({
    email: input.email,
    entryType: "spend",
    creditKind: "tier",
    amount: input.amount,
    source: input.source,
    metadata: input.metadata,
    balanceAfter: available,
  });

  return available;
}

export async function addSquareCredits(input: {
  email: string;
  amountCents: number;
  source: string;
  metadata?: Record<string, unknown>;
}): Promise<number> {
  const account = await ensureEcosystemAccount(input.email);
  const balance = account.squareCreditsCents + input.amountCents;
  await updateEcosystemProfile(input.email, { square_credits_cents: balance });
  await appendLedger({
    email: input.email,
    entryType: "earn",
    creditKind: "square",
    amount: input.amountCents,
    source: input.source,
    metadata: input.metadata,
    balanceAfter: balance,
  });
  return balance;
}

export async function recordWeeklyGameplay(email: string, amountCents: number): Promise<void> {
  const account = await ensureEcosystemAccount(email);
  const weekKey = isoWeekKey();
  const weeklyGameplay =
    account.weeklyPeriodKey === weekKey
      ? account.weeklyGameplayCents + amountCents
      : amountCents;

  await updateEcosystemProfile(email, {
    weekly_gameplay_cents: weeklyGameplay,
    weekly_period_key: weekKey,
  });
}

export async function gameplayToTierCredits(amountCents: number): Promise<number> {
  const config = await getAdminConfig("tier_credits");
  const centsPerCredit = config.centsPerCredit ?? 100;
  return Math.floor(amountCents / centsPerCredit);
}

export async function listRecentCreditActivity(email: string, limit = 12) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_credit_ledger")
    .select("id, entry_type, credit_kind, amount, source, created_at")
    .eq("email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    entryType: row.entry_type as "earn" | "spend",
    creditKind: row.credit_kind as CreditKind,
    amount: Number(row.amount),
    source: row.source as string,
    createdAt: row.created_at as string,
  }));
}
