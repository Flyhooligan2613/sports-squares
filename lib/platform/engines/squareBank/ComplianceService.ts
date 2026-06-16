import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { DAILY_WITHDRAWAL_VELOCITY_CENTS, LARGE_WITHDRAWAL_REVIEW_CENTS } from "./config";
import type { SquareBankPostEntryInput } from "./types";

export interface ComplianceCheckResult {
  allowed: boolean;
  requiresReview?: boolean;
  fraudHold?: boolean;
  reason?: string;
}

/** Compliance stubs — fraud hold, velocity, large withdrawal, KYC hooks. */
export async function checkComplianceForEntry(
  input: SquareBankPostEntryInput,
  accountId: string
): Promise<ComplianceCheckResult> {
  if (input.entryType === "withdrawal_request" || input.entryType === "withdrawal_completed") {
    if (input.amountCents >= LARGE_WITHDRAWAL_REVIEW_CENTS) {
      return { allowed: true, requiresReview: true };
    }

    const velocityOk = await checkWithdrawalVelocity(accountId, input.amountCents);
    if (!velocityOk) {
      return { allowed: false, reason: "Daily withdrawal velocity limit exceeded." };
    }
  }

  if (input.entryType === "withdrawal_completed") {
    const kycOk = await checkKycStatus(input.email);
    if (!kycOk) {
      return { allowed: true, requiresReview: true, reason: "KYC verification pending." };
    }
  }

  return { allowed: true };
}

export function requiresWithdrawalReview(amountCents: number): boolean {
  return amountCents >= LARGE_WITHDRAWAL_REVIEW_CENTS;
}

async function checkWithdrawalVelocity(accountId: string, amountCents: number): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("square_bank_ledger")
    .select("amount_cents")
    .eq("account_id", accountId)
    .in("entry_type", ["withdrawal_request", "withdrawal_completed"])
    .gte("created_at", startOfDay.toISOString());

  const todayTotal = (data ?? []).reduce((s, r) => s + Number(r.amount_cents), 0);
  return todayTotal + amountCents <= DAILY_WITHDRAWAL_VELOCITY_CENTS;
}

async function checkKycStatus(email: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("square_bank_accounts")
    .select("kyc_status")
    .eq("player_email", email.toLowerCase().trim())
    .maybeSingle();

  return data?.kyc_status === "verified" || data?.kyc_status === "none";
}

export async function applyFraudHold(email: string, _reason: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("square_bank_accounts")
    .update({
      status: "fraud_hold",
      updated_at: new Date().toISOString(),
    })
    .eq("player_email", email.toLowerCase().trim());
}
