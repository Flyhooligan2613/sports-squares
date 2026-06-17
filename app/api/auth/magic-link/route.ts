import { NextResponse } from "next/server";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { sendPlayerMagicLinkEmail } from "@/lib/auth/playerMagicLink";
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
      { error: "Sign-in is not configured." },
      { status: 503 }
    );
  }

  if (!isResendConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sign-in email is not configured. Contact support or use your purchase confirmation link.",
      },
      { status: 503 }
    );
  }

  const rateLimited = enforceRateLimit(
    "auth:magic-link",
    resolveClientIpFromRequest(request),
    RATE_LIMITS.magicLink
  );
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as {
      email?: string;
      identifier?: string;
      rememberMe?: boolean;
      deviceKey?: string;
      referralCode?: string;
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
      return NextResponse.json(
        {
          error:
            "No account found for this email. Create a free account or use the email from your Stripe receipt.",
        },
        { status: 404 }
      );
    }

    const result = await sendPlayerMagicLinkEmail(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: formatPlayerAuthError(result.error ?? "Could not send sign-in link.") },
        { status: 502 }
      );
    }

    if (isSupabaseAdminConfigured() && email) {
      const { upsertAuthProfile } = await import("@/lib/auth/security/db");
      await upsertAuthProfile({
        email,
        rememberMe: body.rememberMe ?? true,
      }).catch(() => undefined);

      if (body.referralCode?.trim()) {
        const { applyReferralCode } = await import("@/lib/platform/ecosystem/referrals");
        await applyReferralCode({
          refereeEmail: email,
          referralCode: body.referralCode.trim(),
          deviceKey: body.deviceKey,
          ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        }).catch(() => undefined);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to send sign-in link.",
      },
      { status: 500 }
    );
  }
}
