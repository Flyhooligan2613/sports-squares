import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { verifyAuthentication } from "@/lib/auth/security/webauthn";
import { createPlayerSessionForEmail } from "@/lib/auth/security/sessionMint";
import { completePlayerSignIn } from "@/lib/auth/security/completeSignIn";
import { resolveClientIp, resolveLoginLocation } from "@/lib/auth/security/securityCenter";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const body = (await request.json()) as {
    email?: string;
    deviceKey?: string;
    response?: unknown;
    rememberMe?: boolean;
  };

  const email = body.email?.trim().toLowerCase();
  const deviceKey = body.deviceKey?.trim();

  if (!email || !deviceKey || !body.response) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    const verified = await verifyAuthentication({
      email,
      deviceKey,
      response: body.response as Parameters<typeof verifyAuthentication>[0]["response"],
    });

    const sessionOk = await createPlayerSessionForEmail(verified.email);
    if (!sessionOk) {
      return NextResponse.json({ error: "Could not create session." }, { status: 500 });
    }

    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const signInResult = await completePlayerSignIn({
      email: verified.email,
      deviceKey,
      userAgent,
      rememberMe: body.rememberMe ?? true,
      lastLocation: resolveLoginLocation(request.headers),
      lastIp: resolveClientIp(request.headers),
    });

    await notifySecurityEvent({
      email: verified.email,
      eventType: "biometric_login",
      metadata: {
        device: signInResult.device.deviceName,
        location: resolveLoginLocation(request.headers) ?? undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Biometric sign-in failed." },
      { status: 401 }
    );
  }
}
