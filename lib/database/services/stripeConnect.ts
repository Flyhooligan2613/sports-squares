import { TABLES } from "@/lib/database/config";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  readConnectFlags,
  retrieveConnectAccount,
} from "@/lib/stripe/connect";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { displayNameFromEmail, normalizeEmail } from "@/lib/player/statsCore";
import type Stripe from "stripe";

interface ConnectProfileRow {
  email: string;
  stripe_connect_account_id: string | null;
  stripe_connect_details_submitted: boolean;
  stripe_connect_payouts_enabled: boolean;
  stripe_connect_onboarded_at: string | null;
}

export async function getPlayerConnectStatus(
  email: string
): Promise<PlayerConnectStatus> {
  const profile = await loadConnectProfile(email);
  if (!profile?.stripe_connect_account_id) {
    return {
      accountId: null,
      detailsSubmitted: false,
      payoutsEnabled: false,
      ready: false,
    };
  }

  return {
    accountId: profile.stripe_connect_account_id,
    detailsSubmitted: profile.stripe_connect_details_submitted,
    payoutsEnabled: profile.stripe_connect_payouts_enabled,
    ready: profile.stripe_connect_payouts_enabled,
  };
}

export async function ensureConnectAccountId(
  email: string,
  accountId: string
): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const normalized = normalizeEmail(email);
  const displayName = displayNameFromEmail(normalized);
  await ensurePlayerProfile(normalized, displayName);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from(TABLES.playerProfiles)
    .update({
      stripe_connect_account_id: accountId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized);

  if (error) throw error;
}

export async function syncConnectAccountFromStripe(
  email: string,
  account: Stripe.Account
): Promise<PlayerConnectStatus> {
  if (!isSupabaseAdminConfigured()) {
    return {
      accountId: account.id,
      detailsSubmitted: account.details_submitted ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      ready: account.payouts_enabled ?? false,
    };
  }

  const normalized = normalizeEmail(email);
  const flags = readConnectFlags(account);
  const supabase = getSupabaseAdmin();

  await ensurePlayerProfile(normalized, displayNameFromEmail(normalized));

  const { error } = await supabase
    .from(TABLES.playerProfiles)
    .update({
      stripe_connect_account_id: account.id,
      stripe_connect_details_submitted: flags.detailsSubmitted,
      stripe_connect_payouts_enabled: flags.payoutsEnabled,
      stripe_connect_onboarded_at: flags.payoutsEnabled
        ? new Date().toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized);

  if (error) throw error;

  return {
    accountId: account.id,
    detailsSubmitted: flags.detailsSubmitted,
    payoutsEnabled: flags.payoutsEnabled,
    ready: flags.payoutsEnabled,
  };
}

export async function refreshPlayerConnectStatus(
  email: string
): Promise<PlayerConnectStatus> {
  const profile = await loadConnectProfile(email);
  if (!profile?.stripe_connect_account_id) {
    return getPlayerConnectStatus(email);
  }

  const account = await retrieveConnectAccount(profile.stripe_connect_account_id);
  const accountEmail =
    (account.metadata?.email as string | undefined)?.trim().toLowerCase() ??
    normalizeEmail(email);

  return syncConnectAccountFromStripe(accountEmail, account);
}

export async function getConnectAccountIdForEmail(
  email: string
): Promise<string | null> {
  const profile = await loadConnectProfile(email);
  if (!profile?.stripe_connect_payouts_enabled) return null;
  return profile.stripe_connect_account_id;
}

async function loadConnectProfile(
  email: string
): Promise<ConnectProfileRow | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLES.playerProfiles)
    .select(
      "email, stripe_connect_account_id, stripe_connect_details_submitted, stripe_connect_payouts_enabled, stripe_connect_onboarded_at"
    )
    .eq("email", normalizeEmail(email))
    .maybeSingle();

  if (error) throw error;
  return (data as ConnectProfileRow | null) ?? null;
}
