import { NextResponse } from "next/server";
import { sendPlayerMagicLinkEmail } from "@/lib/auth/playerMagicLink";
import { formatPlayerAuthError } from "@/lib/auth/formatPlayerAuthError";
import { TABLES } from "@/lib/database/config";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isStripeConfigured } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Resend is not configured." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { sessionId?: string };
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data: player, error } = await supabase
      .from(TABLES.players)
      .select("email")
      .eq("stripe_checkout_session_id", sessionId)
      .maybeSingle();

    if (error) throw error;

    const email = (player?.email as string | null)?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Purchase not found or still processing." },
        { status: 404 }
      );
    }

    const result = await sendPlayerMagicLinkEmail(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: formatPlayerAuthError(result.error ?? "Could not resend link.") },
        { status: 429 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to resend magic link.",
      },
      { status: 500 }
    );
  }
}
