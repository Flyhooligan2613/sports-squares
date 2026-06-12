import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { syncAllPickemContests } from "@/lib/pickem/engine/syncContest";
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
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Pick'em sync failed.",
      },
      { status: 500 }
    );
  }
}
