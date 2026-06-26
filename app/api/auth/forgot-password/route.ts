import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { sendPlayerPasswordResetEmailFlow } from "@/lib/auth/playerPasswordReset";
import { playerEmailCanSignIn } from "@/lib/auth/playerAccess";
import { isResendConfigured } from "@/lib/email/resend";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  enforceRateLimit,
  RATE_LIMITS,
  resolveClientIpFromRequest,
} from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Password reset is not configured." },
      { status: 503 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      { error: "Password reset email is not configured. Contact support." },
      { status: 503 }
    );
  }

  const rateLimited = enforceRateLimit(
    "auth:forgot-password",
    resolveClientIpFromRequest(request),
    RATE_LIMITS.magicLink
  );
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as {
      email?: string;
      identifier?: string;
    };

    let email = body.email?.trim().toLowerCase() ?? "";

    if (!email && body.identifier?.trim()) {
      const { resolveLoginIdentifier } = await import("@/lib/platform/ecosystem/identifiers");
      const resolved = await resolveLoginIdentifier(body.identifier);
      if (resolved) email = resolved;
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email, username, phone, or Player ID." },
        { status: 400 }
      );
    }

    const canSignIn = await playerEmailCanSignIn(email);
    if (!canSignIn) {
      // Same response as success — prevents account enumeration.
      return NextResponse.json({ ok: true });
    }

    const result = await sendPlayerPasswordResetEmailFlow(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: formatPlayerAuthError(result.error ?? "Could not send reset link.") },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const raw = safeApiErrorMessage(err, "generic");
    return NextResponse.json(
      { error: formatPlayerAuthError(raw) },
      { status: 500 }
    );
  }
}
