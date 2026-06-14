import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { completePlayerSignIn } from "@/lib/auth/security/completeSignIn";
import {
  registerPlayerAccount,
  validateSignupPayload,
} from "@/lib/auth/playerSignup";
import {
  resolveClientIp,
  resolveLoginLocation,
} from "@/lib/auth/security/securityCenter";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Sign-up is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      avatarEmoji?: string;
      deviceKey?: string;
      rememberMe?: boolean;
      referralCode?: string;
    };

    if (body.confirmPassword !== undefined && body.password !== body.confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    const validated = validateSignupPayload(body);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { email, slug, authUserId } = await registerPlayerAccount(validated.payload);

    const supabase = await createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: validated.payload.password,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        {
          error:
            "Account created but sign-in failed. Try signing in with your email and password.",
          slug,
        },
        { status: 502 }
      );
    }

    if (body.deviceKey?.trim()) {
      await completePlayerSignIn({
        email,
        authUserId: authUserId ?? signInData.user.id,
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

    return NextResponse.json({ ok: true, slug, email });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign-up failed.";
    const status = /already exists/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
