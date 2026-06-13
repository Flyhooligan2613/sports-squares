import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/player/statsCore";
import {
  getAuthProfile,
  listSecurityEvents,
  listTrustedDevices,
  recordSecurityEvent,
  revokeAllTrustedDevices,
  revokeTrustedDevice,
  type SecurityEventType,
} from "@/lib/auth/security/db";

export interface AdminPlayerSecuritySummary {
  email: string;
  emailVerified: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  accountSuspended: boolean;
  securityFlagged: boolean;
  onboardingCompleted: boolean;
  authUserId: string | null;
  trustedDeviceCount: number;
  savedPaymentLast4: string | null;
  recentEvents: Awaited<ReturnType<typeof listSecurityEvents>>;
  devices: Awaited<ReturnType<typeof listTrustedDevices>>;
}

export async function searchPlayerEmails(query: string, limit = 20): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const { data, error } = await supabase
    .from("player_auth_profiles")
    .select("email")
    .ilike("email", `%${term}%`)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => row.email as string);
}

export async function getAdminPlayerSecuritySummary(
  email: string
): Promise<AdminPlayerSecuritySummary | null> {
  const normalized = normalizeEmail(email);
  const profile = await getAuthProfile(normalized);
  if (!profile) return null;

  const [devices, recentEvents] = await Promise.all([
    listTrustedDevices(normalized),
    listSecurityEvents(normalized, 40),
  ]);

  return {
    email: normalized,
    emailVerified: Boolean(profile.email_verified_at),
    biometricEnabled: Boolean(profile.biometric_enabled),
    pinEnabled: Boolean(profile.pin_enabled),
    accountSuspended: Boolean(profile.account_suspended),
    securityFlagged: Boolean(profile.security_flagged),
    onboardingCompleted: Boolean(profile.onboarding_completed_at),
    authUserId: (profile.auth_user_id as string | null) ?? null,
    trustedDeviceCount: devices.length,
    savedPaymentLast4: (profile.payment_method_last4 as string | null) ?? null,
    recentEvents,
    devices,
  };
}

export async function adminForceLogoutPlayer(
  email: string,
  adminEmail: string
): Promise<void> {
  const normalized = normalizeEmail(email);
  await revokeAllTrustedDevices(normalized);

  const profile = await getAuthProfile(normalized);
  if (profile?.auth_user_id) {
    await getSupabaseAdmin().auth.admin.signOut(profile.auth_user_id as string, "global");
  }

  await recordSecurityEvent({
    email: normalized,
    eventType: "session_revoked",
    metadata: { reason: "admin_force_logout", admin: adminEmail },
  });

  await recordSecurityEvent({
    email: normalized,
    eventType: "sign_out_all",
    metadata: { reason: "admin_force_logout", admin: adminEmail },
  });
}

export async function adminRevokePlayerDevice(
  email: string,
  deviceId: string,
  adminEmail: string
): Promise<void> {
  await revokeTrustedDevice(normalizeEmail(email), deviceId);
  await recordSecurityEvent({
    email: normalizeEmail(email),
    eventType: "device_revoked",
    metadata: { deviceId, admin: adminEmail },
  });
}

export async function adminSetPlayerSecurityFlags(input: {
  email: string;
  suspended?: boolean;
  flagged?: boolean;
  adminEmail: string;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { email: normalized, updated_at: now };

  if (input.suspended !== undefined) {
    patch.account_suspended = input.suspended;
    patch.suspended_at = input.suspended ? now : null;
  }
  if (input.flagged !== undefined) {
    patch.security_flagged = input.flagged;
    patch.flagged_at = input.flagged ? now : null;
  }

  const { error } = await supabase.from("player_auth_profiles").upsert(patch, { onConflict: "email" });
  if (error) throw error;

  const eventType: SecurityEventType = input.suspended
    ? "account_secured"
    : input.flagged
      ? "unusual_login"
      : "profile_update";

  await recordSecurityEvent({
    email: normalized,
    eventType,
    metadata: {
      suspended: input.suspended,
      flagged: input.flagged,
      admin: input.adminEmail,
    },
  });

  if (input.suspended) {
    await adminForceLogoutPlayer(normalized, input.adminEmail);
  }
}
