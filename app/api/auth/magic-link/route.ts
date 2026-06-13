import { NextResponse } from "next/server";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import {
  playerEmailHasPurchases,
  sendPlayerMagicLinkEmail,
} from "@/lib/auth/playerMagicLink";
import { isResendConfigured } from "@/lib/email/resend";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

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

  try {
    const body = (await request.json()) as {
      email?: string;
      rememberMe?: boolean;
      deviceKey?: string;
    };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const hasPurchases = await playerEmailHasPurchases(email);
    if (!hasPurchases) {
      return NextResponse.json(
        {
          error:
            "No boards found for this email. Use the same address from your Stripe receipt.",
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
