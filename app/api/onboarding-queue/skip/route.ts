import { NextResponse } from "next/server";
import { getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import type { OnboardingModuleId } from "@/lib/platform/engines/onboardingQueue";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  let body: { moduleId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const moduleId = body.moduleId as OnboardingModuleId | undefined;
  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required." }, { status: 400 });
  }

  try {
    const result = await OnboardingQueueEngine.skipModule(auth, moduleId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[onboarding-queue/skip]", err);
    return NextResponse.json({ error: "Could not skip module." }, { status: 400 });
  }
}
