import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isPushConfigured } from "@/lib/push/config";
import { runDailyPushDigest } from "@/lib/push/dailyDigest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runPushDigest(request);
}

export async function POST(request: Request) {
  return runPushDigest(request);
}

async function runPushDigest(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No database." });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Push not configured." });
  }

  try {
    const result = await runDailyPushDigest();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[push-digest]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Push digest failed." },
      { status: 500 }
    );
  }
}
