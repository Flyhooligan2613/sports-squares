import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { syncAllPoolWinners } from "@/lib/engines/winnerSyncEngine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runWinnerSync(request);
}

export async function POST(request: Request) {
  return runWinnerSync(request);
}

async function runWinnerSync(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const result = await syncAllPoolWinners();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Winner sync failed.",
      },
      { status: 500 }
    );
  }
}
