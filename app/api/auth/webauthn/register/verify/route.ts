import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { verifyRegistration } from "@/lib/auth/security/webauthn";
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
    deviceKey?: string;
    response?: unknown;
  };

  const deviceKey = body.deviceKey?.trim();
  if (!deviceKey || !body.response) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await verifyRegistration({
      email: user.email,
      deviceKey,
      response: body.response as Parameters<typeof verifyRegistration>[0]["response"],
    });

    await upsertAuthProfile({
      email: user.email,
      biometricPrompted: true,
      biometricEnabled: true,
    });

    await notifySecurityEvent({
      email: user.email,
      eventType: "biometric_enabled",
      metadata: { deviceKey },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "generic") },
      { status: 400 }
    );
  }
}
