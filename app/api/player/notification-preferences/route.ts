import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  listPlayerPushSubscriptions,
  setPlayerPushEnabled,
} from "@/lib/push/subscriptions";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/preferenceState";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let pushSubscribed = false;
  if (isSupabaseAdminConfigured()) {
    try {
      const subs = await listPlayerPushSubscriptions(user.email);
      pushSubscribed = subs.some((s) => s.enabled);
    } catch {
      pushSubscribed = false;
    }
  }

  return NextResponse.json({
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
    pushSubscribed,
    emailDelivery: "ui_ready",
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { pushEnabled?: boolean };
    if (typeof body.pushEnabled === "boolean") {
      await setPlayerPushEnabled(user.email, body.pushEnabled);
    }
    const subs = await listPlayerPushSubscriptions(user.email);
    return NextResponse.json({
      ok: true,
      pushSubscribed: subs.some((s) => s.enabled),
    });
  } catch (err) {
    console.error("[notification-preferences]", err);
    return NextResponse.json({ error: "Failed to update preferences." }, { status: 500 });
  }
}
