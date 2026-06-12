import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { runAnnouncementAutomation } from "@/lib/platform/announcements/automation/engine";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runAutomation(request);
}

export async function POST(request: Request) {
  return runAutomation(request);
}

async function runAutomation(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No database." });
  }

  try {
    const result = await runAnnouncementAutomation();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[announcement-automation]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Automation failed." },
      { status: 500 }
    );
  }
}
