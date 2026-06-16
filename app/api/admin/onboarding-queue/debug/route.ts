import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const email = new URL(request.url).searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "email query param required." }, { status: 400 });
  }

  try {
    const [snapshot, queue] = await Promise.all([
      OnboardingQueueEngine.getDebugSnapshot(normalizeEmail(email)),
      OnboardingQueueEngine.getQueue(normalizeEmail(email)),
    ]);
    return NextResponse.json({ snapshot, queue });
  } catch (err) {
    console.error("[admin/onboarding-queue/debug]", err);
    return NextResponse.json({ error: "Debug load failed." }, { status: 500 });
  }
}
