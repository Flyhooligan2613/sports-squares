import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { playerEmailCanSignIn } from "@/lib/auth/playerAccess";
import { resolveLoginIdentifier } from "@/lib/platform/ecosystem/identifiers";
import { completePlayerSignIn } from "@/lib/auth/security/completeSignIn";
import {
  resolveClientIp,
  resolveLoginLocation,
} from "@/lib/auth/security/securityCenter";
import {
  enforceRateLimit,
  RATE_LIMITS,
  resolveClientIpFromRequest,
} from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Sign-in is not configured." }, { status: 503 });
  }

  const rateLimited = enforceRateLimit(
    "auth:password-login",
    resolveClientIpFromRequest(request),
    RATE_LIMITS.login
  );
  if (rateLimited) return rateLimited;

  try {
    const body = (await request.json()) as {
      email?: string;
      identifier?: string;
      password?: string;
      rememberMe?: boolean;
      deviceKey?: string;
      referralCode?: string;
    };

    if (!body.password?.trim()) {
      return NextResponse.json({ error: "Enter your password." }, { status: 400 });
    }

    let email = body.email?.trim().toLowerCase() ?? "";
    if (!email && body.identifier?.trim()) {
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

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: body.password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          error: formatPlayerAuthError(
            error?.message ??
              "Invalid password. Use your email link, or set a password in Security after signing in."
          ),
        },
        { status: 401 }
      );
    }

    if (body.deviceKey?.trim()) {
      await completePlayerSignIn({
        email,
        authUserId: data.user.id,
        deviceKey: body.deviceKey.trim(),
        userAgent: request.headers.get("user-agent") ?? "unknown",
        rememberMe: body.rememberMe ?? true,
        lastLocation: resolveLoginLocation(request.headers),
        lastIp: resolveClientIp(request.headers),
      });
    }

    if (body.referralCode?.trim()) {
      const { applyReferralCode } = await import("@/lib/platform/ecosystem/referrals");
      await applyReferralCode({
        refereeEmail: email,
        referralCode: body.referralCode.trim(),
        deviceKey: body.deviceKey,
        ip: resolveClientIp(request.headers),
      }).catch(() => undefined);
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
