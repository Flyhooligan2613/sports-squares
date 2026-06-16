import { NextResponse } from "next/server";
import { getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await OnboardingQueueEngine.getQueue(auth);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[onboarding-queue/queue]", err);
    return NextResponse.json({ queue: [], state: null, nextModule: null, debugMode: false });
  }
}
