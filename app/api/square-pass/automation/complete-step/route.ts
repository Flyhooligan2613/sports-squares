import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";
import type { SquarePassCompleteStepId } from "@/lib/platform/engines/squarePass/automation";

export const dynamic = "force-dynamic";

const VALID_STEPS: SquarePassCompleteStepId[] = [
  "welcome",
  "mystery",
  "reward_reveal",
  "founder",
  "whats_next",
  "profile_customization",
  "daily_bonus",
  "flash_event",
  "surprise",
];

export async function POST(request: Request) {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  let body: {
    step?: string;
    flashCampaignSlug?: string;
    surpriseSlug?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const step = body.step as SquarePassCompleteStepId | undefined;
  if (!step || !VALID_STEPS.includes(step)) {
    return NextResponse.json({ error: "Invalid step." }, { status: 400 });
  }

  try {
    const result = await SquarePassEngine.completeAutomationStep(auth, step, {
      flashCampaignSlug: body.flashCampaignSlug,
      surpriseSlug: body.surpriseSlug,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[square-pass/automation/complete-step]", err);
    return NextResponse.json({ error: "Could not complete step." }, { status: 500 });
  }
}
