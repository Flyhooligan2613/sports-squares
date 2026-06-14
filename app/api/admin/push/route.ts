import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  countPushSubscribers,
  getPushDigestSettings,
  updatePushDigestSettings,
} from "@/lib/push/subscriptions";
import { isPushConfigured } from "@/lib/push/config";
import { sendManualPushBroadcast, runDailyPushDigest } from "@/lib/push/dailyDigest";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ configured: false, subscriberCount: 0, log: [], settings: null });
  }

  const supabase = getSupabaseAdmin();
  const [subscriberCount, settings, logResult] = await Promise.all([
    countPushSubscribers(),
    getPushDigestSettings(),
    supabase
      .from("push_notification_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  return NextResponse.json({
    configured: isPushConfigured(),
    subscriberCount,
    settings,
    log: logResult.data ?? [],
  });
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push not configured. Add VAPID keys to environment variables." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as {
      action?: "send" | "run_daily" | "update_settings";
      title?: string;
      body?: string;
      url?: string;
      dailyEnabled?: boolean;
      dailyHourEt?: number;
    };

    if (body.action === "update_settings") {
      await updatePushDigestSettings({
        dailyEnabled: Boolean(body.dailyEnabled),
        dailyHourEt: Number(body.dailyHourEt ?? 9),
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "run_daily") {
      const result = await runDailyPushDigest({ force: true, sentBy: admin.email });
      await logPlatformAudit({
        eventType: "push.daily_digest",
        summary: `Manual daily push: ${result.successCount}/${result.subscriberCount} delivered`,
        actorEmail: admin.email,
        actorRole: "admin",
        metadata: result as unknown as Record<string, unknown>,
      });
      return NextResponse.json({ ok: true, result });
    }

    const title = body.title?.trim();
    const messageBody = body.body?.trim();
    if (!title || !messageBody) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }

    const result = await sendManualPushBroadcast({
      title,
      body: messageBody,
      url: body.url,
      sentBy: admin.email,
    });

    await logPlatformAudit({
      eventType: "push.manual_send",
      summary: `Push sent to ${result.successCount}/${result.subscriberCount} devices`,
      actorEmail: admin.email,
      actorRole: "admin",
      metadata: { title, ...result },
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[admin/push]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Push action failed." },
      { status: 500 }
    );
  }
}
