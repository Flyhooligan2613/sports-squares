import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  deviceHasPasskey,
  emailHasPasskey,
} from "@/lib/auth/security/webauthn";
import {
  getAuthProfile,
  isTrustedDevice,
} from "@/lib/auth/security/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceKey = searchParams.get("deviceKey")?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    const email = user.email.toLowerCase();
    const profile = isSupabaseAdminConfigured() ? await getAuthProfile(email) : null;
    const trusted = deviceKey
      ? await isTrustedDevice(email, deviceKey)
      : false;
    const passkeyOnDevice = deviceKey
      ? await deviceHasPasskey(email, deviceKey)
      : false;

    return NextResponse.json({
      authenticated: true,
      email,
      emailVerified: Boolean(profile?.email_verified_at),
      rememberMe: profile?.remember_me ?? true,
      trustedDevice: trusted,
      passkeyAvailable: passkeyOnDevice,
      webAuthnSupported: true,
    });
  }

  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";
  let passkeyAvailable = false;

  if (email && deviceKey && isSupabaseAdminConfigured()) {
    passkeyAvailable = await deviceHasPasskey(email, deviceKey);
    if (!passkeyAvailable) {
      passkeyAvailable = await emailHasPasskey(email);
    }
  }

  return NextResponse.json({
    authenticated: false,
    email: email || null,
    passkeyAvailable,
    webAuthnSupported: true,
  });
}
