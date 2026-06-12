import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/auth";
import { processPayoutJobs } from "@/lib/payouts/payoutJobs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runPayoutWorker(request);
}

export async function POST(request: Request) {
  return runPayoutWorker(request);
}

async function runPayoutWorker(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const result = await processPayoutJobs();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payout worker failed." },
      { status: 500 }
    );
  }
}
