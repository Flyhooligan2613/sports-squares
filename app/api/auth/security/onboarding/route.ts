import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { upsertAuthProfile } from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

  const body = (await request.json()) as {
    biometricEnabled?: boolean;
    pinEnabled?: boolean;
  };

  await upsertAuthProfile({
    email: user.email,
    biometricEnabled: body.biometricEnabled ?? false,
    pinEnabled: body.pinEnabled ?? false,
    onboardingCompleted: true,
    biometricPrompted: true,
  });

  if (body.biometricEnabled) {
    await notifySecurityEvent({
      email: user.email,
      eventType: "biometric_enabled",
    });
  }

  if (body.pinEnabled) {
    await notifySecurityEvent({
      email: user.email,
      eventType: "pin_enabled",
    });
  }

  return NextResponse.json({ ok: true });
}
