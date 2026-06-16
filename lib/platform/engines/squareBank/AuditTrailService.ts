import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SquareBankAccountType, SquareBankPostEntryInput } from "./types";

export async function recordAuditTrail(input: {
  ledgerEntryId: string;
  playerEmail: string;
  action: string;
  amountCents: number;
  balanceBeforeCents: number;
  balanceAfterCents: number;
  accountType: SquareBankAccountType;
  referenceType?: string | null;
  referenceId?: string | null;
  module?: string;
  adminEmail?: string;
  deviceKey?: string;
  ipAddress?: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("square_bank_audit_trail").insert({
    ledger_entry_id: input.ledgerEntryId,
    player_email: input.playerEmail,
    action: input.action,
    amount_cents: input.amountCents,
    balance_before_cents: input.balanceBeforeCents,
    balance_after_cents: input.balanceAfterCents,
    account_type: input.accountType,
    reference_type: input.referenceType ?? null,
    reference_id: input.referenceId ?? null,
    module: input.module ?? null,
    admin_email: input.adminEmail ?? null,
    device_key: input.deviceKey ?? null,
    ip_address: input.ipAddress ?? null,
  });
}

export function buildAuditAction(input: SquareBankPostEntryInput): string {
  return `${input.direction}_${input.entryType}`;
}
