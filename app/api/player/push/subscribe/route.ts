import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { upsertPushSubscription } from "@/lib/push/subscriptions";
import { isPushConfigured } from "@/lib/push/config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push notifications are not enabled yet." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to enable notifications." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
      userAgent?: string;
    };

    const endpoint = body.endpoint?.trim();
    const p256dh = body.keys?.p256dh?.trim();
    const auth = body.keys?.auth?.trim();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: "Invalid subscription." }, { status: 400 });
    }

    await upsertPushSubscription({
      email: user.email,
      endpoint,
      p256dh,
      auth,
      userAgent: body.userAgent ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push/subscribe]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Subscribe failed." },
      { status: 500 }
    );
  }
}
