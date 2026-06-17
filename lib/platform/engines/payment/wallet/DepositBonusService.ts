import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import { FIRST_DEPOSIT_MATCH_MAX_CENTS } from "./config";
import { creditBalance } from "./WalletLedgerService";

export async function hasReceivedDepositBonus(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("deposit_bonus_grants")
    .select("id")
    .eq("player_email", normalizeEmail(email))
    .maybeSingle();

  return Boolean(data?.id);
}

export function calculateFirstDepositMatchBonusCents(depositAmountCents: number): number {
  const deposit = Math.floor(depositAmountCents);
  if (deposit <= 0) return 0;
  return Math.min(deposit, FIRST_DEPOSIT_MATCH_MAX_CENTS);
}

/** Grant 100% first-deposit match (capped) to play-only bonus_credits. */
export async function grantFirstDepositMatchBonus(input: {
  email: string;
  walletId: string;
  depositAmountCents: number;
  depositReferenceId: string;
  paymentTransactionId?: string | null;
}): Promise<{ granted: boolean; bonusAmountCents?: number; ledgerId?: string }> {
  const email = normalizeEmail(input.email);

  if (await hasReceivedDepositBonus(email)) {
    return { granted: false };
  }

  const bonusAmountCents = calculateFirstDepositMatchBonusCents(input.depositAmountCents);
  if (bonusAmountCents <= 0) {
    return { granted: false };
  }

  const entry = await creditBalance({
    email,
    walletId: input.walletId,
    balanceType: "bonus_credits",
    amountCents: bonusAmountCents,
    entryType: "bonus_credit",
    referenceType: "deposit_bonus",
    referenceId: input.depositReferenceId,
    paymentTransactionId: input.paymentTransactionId ?? null,
    description: `First deposit match — $${(bonusAmountCents / 100).toFixed(2)} play-only bonus`,
    metadata: {
      bonusType: "first_deposit_match",
      depositAmountCents: input.depositAmountCents,
      maxBonusCents: FIRST_DEPOSIT_MATCH_MAX_CENTS,
      playOnly: true,
      winningsToCash: true,
    },
  });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("deposit_bonus_grants").insert({
    player_email: email,
    wallet_id: input.walletId,
    deposit_reference_id: input.depositReferenceId,
    deposit_amount_cents: input.depositAmountCents,
    bonus_amount_cents: bonusAmountCents,
    max_bonus_cents: FIRST_DEPOSIT_MATCH_MAX_CENTS,
    payment_transaction_id: input.paymentTransactionId ?? null,
    bonus_ledger_id: entry.id,
  });

  if (error) {
    if (error.code === "23505") return { granted: false };
    throw error;
  }

  return { granted: true, bonusAmountCents, ledgerId: entry.id };
}
