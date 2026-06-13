import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  getAuthProfile,
  listSecurityEvents,
  listTrustedDevices,
} from "@/lib/auth/security/db";
import {
  computeSecurityScore,
  securityEventLabel,
} from "@/lib/auth/security/securityCenter";

export const dynamic = "force-dynamic";

const SECURITY_TIPS = [
  "Enable Face ID or fingerprint for instant unlock.",
  "Set a Quick PIN as backup when biometrics are unavailable.",
  "Review trusted devices monthly and remove anything unfamiliar.",
  "Never share your email login link with anyone.",
];

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceKey = new URL(request.url).searchParams.get("deviceKey")?.trim() ?? "";
  const email = user.email.toLowerCase();
  const profile = await getAuthProfile(email);
  const devices = await listTrustedDevices(email);
  const events = await listSecurityEvents(email, 25);

  const biometricEnabled = Boolean(profile?.biometric_enabled);
  const pinEnabled = Boolean(profile?.pin_enabled);
  const emailVerified = Boolean(profile?.email_verified_at);
  const onboardingCompleted = Boolean(profile?.onboarding_completed_at);

  return NextResponse.json({
    score: computeSecurityScore({
      emailVerified,
      biometricEnabled,
      pinEnabled,
      trustedDeviceCount: devices.length,
    }),
    biometricEnabled,
    pinEnabled,
    emailVerified,
    onboardingCompleted,
    rememberMe: profile?.remember_me ?? true,
    trustedDevices: devices.map((device) => ({
      id: device.id,
      deviceName: device.customName || device.deviceName,
      platform: device.platform,
      browserName: device.browserName,
      lastLocation: device.lastLocation,
      lastActiveAt: device.lastActiveAt,
      registeredAt: device.registeredAt,
      acknowledgedAt: device.acknowledgedAt,
      isCurrent: device.deviceKey === deviceKey,
    })),
    recentEvents: events.map((event) => ({
      id: event.id,
      type: event.eventType,
      label: securityEventLabel(event.eventType),
      metadata: event.metadata,
      createdAt: event.createdAt,
    })),
    unacknowledgedDevices: devices
      .filter((device) => !device.acknowledgedAt && device.deviceKey !== deviceKey)
      .map((device) => ({
        id: device.id,
        deviceName: device.deviceName,
        platform: device.platform,
        browserName: device.browserName,
        lastLocation: device.lastLocation,
        registeredAt: device.registeredAt,
      })),
    activeSessions: devices.length,
    tips: SECURITY_TIPS,
  });
}
