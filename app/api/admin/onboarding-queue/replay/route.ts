import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: { email?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "email required." }, { status: 400 });
  }

  try {
    const state = await OnboardingQueueEngine.replayOnboarding(normalizeEmail(email));
    return NextResponse.json({ ok: true, state });
  } catch (err) {
    console.error("[admin/onboarding-queue/replay]", err);
    return NextResponse.json({ error: "Replay failed." }, { status: 500 });
  }
}
