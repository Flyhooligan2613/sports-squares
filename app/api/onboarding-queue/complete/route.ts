import { NextResponse } from "next/server";
import { getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import type { OnboardingModuleId } from "@/lib/platform/engines/onboardingQueue";

export const dynamic = "force-dynamic";

const VALID_MODULES: OnboardingModuleId[] = [
  "welcome",
  "mystery_pass",
  "reward_reveal",
  "founder",
  "birthday",
  "flash_event",
  "season_event",
  "profile",
  "missions",
  "competitor_score",
  "choose_journey",
  "navigate_dashboard",
  "daily_bonus",
  "surprise",
];

export async function POST(request: Request) {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  let body: { moduleId?: string; metadata?: Record<string, unknown> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const moduleId = body.moduleId as OnboardingModuleId | undefined;
  if (!moduleId || !VALID_MODULES.includes(moduleId)) {
    return NextResponse.json({ error: "Invalid moduleId." }, { status: 400 });
  }

  try {
    const result = await OnboardingQueueEngine.completeModule(auth, {
      moduleId,
      metadata: body.metadata,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[onboarding-queue/complete]", err);
    return NextResponse.json({ error: "Could not complete module." }, { status: 500 });
  }
}
