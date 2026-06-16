import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { OnboardingQueueEngine } from "@/lib/platform/engines/onboardingQueue";
import type { OnboardingModuleId } from "@/lib/platform/engines/onboardingQueue";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const config = await OnboardingQueueEngine.listConfig();
    return NextResponse.json({ config });
  } catch (err) {
    console.error("[admin/onboarding-queue/config GET]", err);
    return NextResponse.json({ error: "Failed to load config." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: {
    moduleId?: string;
    enabled?: boolean;
    orderOverride?: number | null;
    delayMs?: number;
    eligibilityJson?: Record<string, unknown>;
    testingMode?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.moduleId) {
    return NextResponse.json({ error: "moduleId required." }, { status: 400 });
  }

  try {
    const row = await OnboardingQueueEngine.updateConfig(body.moduleId as OnboardingModuleId, {
      enabled: body.enabled,
      orderOverride: body.orderOverride,
      delayMs: body.delayMs,
      eligibilityJson: body.eligibilityJson,
      testingMode: body.testingMode,
    });
    return NextResponse.json({ config: row });
  } catch (err) {
    console.error("[admin/onboarding-queue/config PATCH]", err);
    return NextResponse.json({ error: "Failed to update config." }, { status: 500 });
  }
}
