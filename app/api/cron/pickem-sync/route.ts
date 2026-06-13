import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { syncAllPickemContests } from "@/lib/pickem/engine/syncContest";
import { runAnnouncementAutomation } from "@/lib/platform/announcements/automation/engine";
import { DEFAULT_PICKEM_SPORT } from "@/lib/pickem/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runPickemSync(request);
}

export async function POST(request: Request) {
  return runPickemSync(request);
}

async function runPickemSync(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const result = await syncAllPickemContests(DEFAULT_PICKEM_SPORT);
    let mlbResult = null;
    try {
      mlbResult = await syncAllPickemContests("mlb");
    } catch (mlbErr) {
      console.error("[pickem-sync] mlb", mlbErr);
    }
    let announcements = null;
    try {
      announcements = await runAnnouncementAutomation();
    } catch (announcementErr) {
      console.error("[pickem-sync] announcement automation", announcementErr);
    }
    return NextResponse.json({ ok: true, result, mlbResult, announcements });
  } catch (err) {
    console.error("[pickem-sync]", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof (err as { message: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Pick'em sync failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
