import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { syncAllSurvivorLeagues } from "@/lib/survivor/engine/syncLeague";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runSurvivorSync(request);
}

export async function POST(request: Request) {
  return runSurvivorSync(request);
}

async function runSurvivorSync(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const result = await syncAllSurvivorLeagues();
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[survivor-sync]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Survivor sync failed." },
      { status: 500 }
    );
  }
}
