import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type FraudSignalType =
  | "duplicate_phone_signup"
  | "duplicate_email_signup"
  | "billing_zip_mismatch"
  | "underage_signup_blocked";

export async function logFraudSignal(input: {
  signalType: FraudSignalType;
  playerEmail?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("fraud_signal_log").insert({
      signal_type: input.signalType,
      player_email: input.playerEmail ?? null,
      ip_address: input.ipAddress ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    /* non-blocking audit log */
  }
}
