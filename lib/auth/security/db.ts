import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";

export type SecurityEventType =
  | "new_device_login"
  | "email_change"
  | "payout_change"
  | "password_change"
  | "unusual_login"
  | "sign_out_all"
  | "device_revoked"
  | "biometric_enabled"
  | "biometric_login"
  | "pin_enabled"
  | "pin_login"
  | "pin_locked"
  | "purchase_confirmed"
  | "profile_update"
  | "phone_change"
  | "session_revoked"
  | "device_acknowledged"
  | "account_secured";

export interface TrustedDevice {
  id: string;
  email: string;
  deviceKey: string;
  deviceName: string;
  customName: string | null;
  platform: string;
  browserName: string | null;
  userAgent: string | null;
  lastLocation: string | null;
  lastIp: string | null;
  lastActiveAt: string;
  registeredAt: string;
  acknowledgedAt: string | null;
  revokedAt: string | null;
}

export interface WebAuthnCredentialRow {
  id: string;
  email: string;
  deviceKey: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
}

function mapDevice(row: Record<string, unknown>): TrustedDevice {
  return {
    id: row.id as string,
    email: row.email as string,
    deviceKey: row.device_key as string,
    deviceName: row.device_name as string,
    customName: (row.custom_name as string | null) ?? null,
    platform: row.platform as string,
    browserName: (row.browser_name as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
    lastLocation: (row.last_location as string | null) ?? null,
    lastIp: (row.last_ip as string | null) ?? null,
    lastActiveAt: row.last_active_at as string,
    registeredAt: row.registered_at as string,
    acknowledgedAt: (row.acknowledged_at as string | null) ?? null,
    revokedAt: (row.revoked_at as string | null) ?? null,
  };
}

export async function upsertAuthProfile(input: {
  email: string;
  authUserId?: string | null;
  emailVerified?: boolean;
  rememberMe?: boolean;
  biometricPrompted?: boolean;
  biometricEnabled?: boolean;
  pinEnabled?: boolean;
  onboardingCompleted?: boolean;
}) {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);
  const patch: Record<string, unknown> = {
    email,
    updated_at: new Date().toISOString(),
  };

  if (input.authUserId !== undefined) patch.auth_user_id = input.authUserId;
  if (input.emailVerified) patch.email_verified_at = new Date().toISOString();
  if (input.rememberMe !== undefined) patch.remember_me = input.rememberMe;
  if (input.biometricPrompted) patch.biometric_prompted_at = new Date().toISOString();
  if (input.biometricEnabled !== undefined) patch.biometric_enabled = input.biometricEnabled;
  if (input.pinEnabled !== undefined) patch.pin_enabled = input.pinEnabled;
  if (input.onboardingCompleted) patch.onboarding_completed_at = new Date().toISOString();

  const { error } = await supabase.from("player_auth_profiles").upsert(patch, { onConflict: "email" });
  if (error) throw error;
}

export async function getAuthProfile(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_auth_profiles")
    .select("*")
    .eq("email", normalizeEmail(email))
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function registerTrustedDevice(input: {
  email: string;
  deviceKey: string;
  deviceName: string;
  platform: string;
  userAgent?: string | null;
  browserName?: string | null;
  lastLocation?: string | null;
  lastIp?: string | null;
}): Promise<{ device: TrustedDevice; isNew: boolean }> {
  const supabase = getSupabaseAdmin();
  const email = normalizeEmail(input.email);
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("player_trusted_devices")
    .select("*")
    .eq("email", email)
    .eq("device_key", input.deviceKey)
    .maybeSingle();

  if (existing && !existing.revoked_at) {
    const { data, error } = await supabase
      .from("player_trusted_devices")
      .update({
        last_active_at: now,
        device_name: input.deviceName,
        platform: input.platform,
        browser_name: input.browserName ?? null,
        last_location: input.lastLocation ?? null,
        last_ip: input.lastIp ?? null,
      })
      .eq("id", existing.id as string)
      .select("*")
      .single();
    if (error) throw error;
    return { device: mapDevice(data as Record<string, unknown>), isNew: false };
  }

  const { data, error } = await supabase
    .from("player_trusted_devices")
    .upsert(
      {
        email,
        device_key: input.deviceKey,
        device_name: input.deviceName,
        platform: input.platform,
        user_agent: input.userAgent ?? null,
        browser_name: input.browserName ?? null,
        last_location: input.lastLocation ?? null,
        last_ip: input.lastIp ?? null,
        last_active_at: now,
        registered_at: now,
        revoked_at: null,
      },
      { onConflict: "email,device_key" }
    )
    .select("*")
    .single();

  if (error) throw error;
  return { device: mapDevice(data as Record<string, unknown>), isNew: !existing };
}

export async function listTrustedDevices(email: string): Promise<TrustedDevice[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_trusted_devices")
    .select("*")
    .eq("email", normalizeEmail(email))
    .is("revoked_at", null)
    .order("last_active_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapDevice(row as Record<string, unknown>));
}

export async function isTrustedDevice(email: string, deviceKey: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_trusted_devices")
    .select("id")
    .eq("email", normalizeEmail(email))
    .eq("device_key", deviceKey)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

export async function revokeTrustedDevice(email: string, deviceId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data: device, error: lookupError } = await supabase
    .from("player_trusted_devices")
    .select("device_key")
    .eq("id", deviceId)
    .eq("email", normalized)
    .maybeSingle();
  if (lookupError) throw lookupError;

  const { error } = await supabase
    .from("player_trusted_devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("email", normalized);
  if (error) throw error;

  if (device?.device_key) {
    await supabase
      .from("player_webauthn_credentials")
      .update({ revoked_at: new Date().toISOString() })
      .eq("email", normalized)
      .eq("device_key", device.device_key as string);
  }
}

export async function revokeAllTrustedDevices(email: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("player_trusted_devices")
    .update({ revoked_at: now })
    .eq("email", normalized)
    .is("revoked_at", null)
    .select("id");
  if (error) throw error;

  await supabase
    .from("player_webauthn_credentials")
    .update({ revoked_at: now })
    .eq("email", normalized)
    .is("revoked_at", null);

  return data?.length ?? 0;
}

export async function renameTrustedDevice(
  email: string,
  deviceId: string,
  customName: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("player_trusted_devices")
    .update({ custom_name: customName.trim() || null })
    .eq("id", deviceId)
    .eq("email", normalizeEmail(email));
  if (error) throw error;
}

export async function acknowledgeTrustedDevice(
  email: string,
  deviceId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("player_trusted_devices")
    .update({ acknowledged_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("email", normalizeEmail(email));
  if (error) throw error;
}

export async function listSecurityEvents(
  email: string,
  limit = 20
): Promise<
  { id: string; eventType: SecurityEventType; metadata: Record<string, unknown>; createdAt: string }[]
> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_security_events")
    .select("id, event_type, metadata, created_at")
    .eq("email", normalizeEmail(email))
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    eventType: row.event_type as SecurityEventType,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }));
}

export async function saveWebAuthnCredential(input: {
  email: string;
  deviceKey: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports: string[];
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("player_webauthn_credentials").upsert(
    {
      email: normalizeEmail(input.email),
      device_key: input.deviceKey,
      credential_id: input.credentialId,
      public_key: input.publicKey,
      counter: input.counter,
      transports: input.transports,
      revoked_at: null,
    },
    { onConflict: "credential_id" }
  );
  if (error) throw error;
}

export async function getWebAuthnCredential(credentialId: string): Promise<WebAuthnCredentialRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_webauthn_credentials")
    .select("*")
    .eq("credential_id", credentialId)
    .is("revoked_at", null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id as string,
    email: data.email as string,
    deviceKey: data.device_key as string,
    credentialId: data.credential_id as string,
    publicKey: data.public_key as string,
    counter: Number(data.counter ?? 0),
    transports: (data.transports as string[]) ?? [],
  };
}

export async function updateWebAuthnCounter(credentialId: string, counter: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("player_webauthn_credentials")
    .update({ counter })
    .eq("credential_id", credentialId);
  if (error) throw error;
}

export async function listWebAuthnCredentialsForEmail(email: string): Promise<WebAuthnCredentialRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_webauthn_credentials")
    .select("*")
    .eq("email", normalizeEmail(email))
    .is("revoked_at", null);
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    deviceKey: row.device_key as string,
    credentialId: row.credential_id as string,
    publicKey: row.public_key as string,
    counter: Number(row.counter ?? 0),
    transports: (row.transports as string[]) ?? [],
  }));
}

export async function recordSecurityEvent(input: {
  email: string;
  eventType: SecurityEventType;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("player_security_events")
    .insert({
      email: normalizeEmail(input.email),
      event_type: input.eventType,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function markSecurityEventNotified(eventId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("player_security_events")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", eventId);
}

export async function saveStepUpToken(input: {
  email: string;
  tokenHash: string;
  purpose: string;
  expiresAt: Date;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("player_step_up_tokens").upsert({
    token_hash: input.tokenHash,
    email: normalizeEmail(input.email),
    purpose: input.purpose,
    expires_at: input.expiresAt.toISOString(),
  });
  if (error) throw error;
}

export async function consumeStepUpToken(
  tokenHash: string,
  email: string,
  purpose: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("player_step_up_tokens")
    .select("token_hash")
    .eq("token_hash", tokenHash)
    .eq("email", normalizeEmail(email))
    .eq("purpose", purpose)
    .gt("expires_at", now)
    .maybeSingle();
  if (error || !data) return false;

  await supabase.from("player_step_up_tokens").delete().eq("token_hash", tokenHash);
  return true;
}
