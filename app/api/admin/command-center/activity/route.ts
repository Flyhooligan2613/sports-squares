import { NextRequest, NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("dashboard");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
  const since = request.nextUrl.searchParams.get("since") ?? undefined;

  try {
    const items = await CommandCenterEngine.getActivityFeed({
      limit: Math.min(100, Math.max(1, limit)),
      since,
    });
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[command-center/activity]", err);
    return NextResponse.json({ error: "Failed to load activity feed." }, { status: 500 });
  }
}
