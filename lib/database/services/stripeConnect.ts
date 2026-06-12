import { TABLES } from "@/lib/database/config";
import { ensurePlayerProfile } from "@/lib/database/services/playerProfiles";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  readConnectFlags,
  retrieveConnectAccount,
  isStripeConnectV2PayoutsEnabled,
} from "@/lib/stripe/connect";
import {
  readWinnerV2ConnectFlags,
  retrieveWinnerConnectV2Account,
  type WinnerConnectV2Account,
} from "@/lib/stripe/connectV2Payouts";
import type { PlayerConnectStatus } from "@/lib/stripe/connectTypes";
import { buildPlayerSlug } from "@/lib/player/slug";
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
  const supabase = getSupabaseAdmin();

  const { data: updated, error: updateError } = await supabase
    .from(TABLES.playerProfiles)
    .update({
      stripe_connect_account_id: accountId,
      updated_at: new Date().toISOString(),
    })
    .eq("email", normalized)
    .select("email")
    .maybeSingle();

  if (updateError) throw updateError;
  if (updated?.email) return;

  const slug = (await ensurePlayerProfile(normalized, displayName)) ??
    buildPlayerSlug(displayName, normalized);

  const { error: insertError } = await supabase.from(TABLES.playerProfiles).insert({
    email: normalized,
    slug,
    display_name: displayName,
    stripe_connect_account_id: accountId,
  });

  if (insertError?.code === "23505") {
    const { error: retryError } = await supabase
      .from(TABLES.playerProfiles)
      .update({
        stripe_connect_account_id: accountId,
        updated_at: new Date().toISOString(),
      })
      .eq("email", normalized);

    if (retryError) throw retryError;
    return;
  }

  if (insertError) throw insertError;
}

export async function syncConnectAccountFromStripeV2(
  email: string,
  account: WinnerConnectV2Account
): Promise<PlayerConnectStatus> {
  const flags = readWinnerV2ConnectFlags(account);
  return syncConnectFlags(email, account.id, flags);
}

async function syncConnectFlags(
  email: string,
  accountId: string,
  flags: { detailsSubmitted: boolean; payoutsEnabled: boolean }
): Promise<PlayerConnectStatus> {
  if (!isSupabaseAdminConfigured()) {
    return {
      accountId,
      detailsSubmitted: flags.detailsSubmitted,
      payoutsEnabled: flags.payoutsEnabled,
      ready: flags.payoutsEnabled,
    };
  }

  const normalized = normalizeEmail(email);
  const supabase = getSupabaseAdmin();

  await ensureConnectAccountId(normalized, accountId);

  const { error } = await supabase
    .from(TABLES.playerProfiles)
    .update({
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
    accountId,
    detailsSubmitted: flags.detailsSubmitted,
    payoutsEnabled: flags.payoutsEnabled,
    ready: flags.payoutsEnabled,
  };
}

export async function syncConnectAccountFromStripe(
  email: string,
  account: Stripe.Account
): Promise<PlayerConnectStatus> {
  const flags = readConnectFlags(account);
  return syncConnectFlags(email, account.id, flags);
}

export async function refreshPlayerConnectStatus(
  email: string
): Promise<PlayerConnectStatus> {
  const profile = await loadConnectProfile(email);
  if (!profile?.stripe_connect_account_id) {
    return getPlayerConnectStatus(email);
  }

  const accountId = profile.stripe_connect_account_id;
  const normalizedEmail = normalizeEmail(email);

  if (isStripeConnectV2PayoutsEnabled()) {
    try {
      const account = await retrieveWinnerConnectV2Account(accountId);
      const accountEmail =
        account.contact_email?.trim().toLowerCase() ?? normalizedEmail;
      return syncConnectAccountFromStripeV2(accountEmail, account);
    } catch (v2Err) {
      console.warn("[stripeConnect] V2 refresh failed, trying Express:", v2Err);
    }
  }

  const account = await retrieveConnectAccount(accountId);
  const accountEmail =
    (account.metadata?.email as string | undefined)?.trim().toLowerCase() ??
    normalizedEmail;

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

function connectErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = String((err as { message?: string }).message ?? "");
    if (message.includes("signed up for Connect")) {
      return "Stripe Connect is not enabled on your Stripe account yet. Enable it in Stripe Dashboard → Connect.";
    }
    if (message.includes("Accounts v2")) {
      return "Stripe Accounts v2 is not enabled on this API key. Enable it in Stripe Dashboard or set STRIPE_CONNECT_V2_PAYOUTS=false to use Express.";
    }
    if (message) return message;
  }
  return "Could not start payout setup.";
}

export { connectErrorMessage };
