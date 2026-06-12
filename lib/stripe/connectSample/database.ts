import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { ConnectSampleAccountRecord } from "@/lib/stripe/connectSample/types";

const TABLE = "connect_sample_accounts";

export async function saveConnectSampleAccountMapping(input: {
  demoUserEmail: string;
  stripeAccountId: string;
  displayName: string;
}): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    // TODO: persist mapping in your database when Supabase is configured.
    console.warn(
      "[connect-sample] SUPABASE_SERVICE_ROLE_KEY missing — account mapping not persisted."
    );
    return;
  }

  const supabase = getSupabaseAdmin();
  const email = input.demoUserEmail.trim().toLowerCase();

  const { error } = await supabase.from(TABLE).upsert(
    {
      demo_user_email: email,
      stripe_account_id: input.stripeAccountId,
      display_name: input.displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "demo_user_email" }
  );

  if (error) throw error;
}

export async function getConnectSampleAccountByEmail(
  demoUserEmail: string
): Promise<ConnectSampleAccountRecord | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("demo_user_email", demoUserEmail.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return (data as ConnectSampleAccountRecord | null) ?? null;
}

export async function updateConnectSampleSubscription(input: {
  stripeAccountId: string;
  status: string | null;
  priceId?: string | null;
  currentPeriodEnd?: string | null;
}): Promise<void> {
  if (!isSupabaseAdminConfigured()) {
    // TODO: write subscription_status to connect_sample_accounts in production.
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({
      subscription_status: input.status,
      subscription_price_id: input.priceId ?? null,
      subscription_current_period_end: input.currentPeriodEnd ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", input.stripeAccountId);

  if (error) throw error;
}

export async function getConnectSampleAccountByStripeId(
  stripeAccountId: string
): Promise<ConnectSampleAccountRecord | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("stripe_account_id", stripeAccountId)
    .maybeSingle();

  if (error) throw error;
  return (data as ConnectSampleAccountRecord | null) ?? null;
}

export { TABLE as CONNECT_SAMPLE_ACCOUNTS_TABLE };
