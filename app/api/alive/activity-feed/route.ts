import { NextResponse } from "next/server";
import { AliveEngine } from "@/lib/platform/alive";

export const dynamic = "force-dynamic";
export const revalidate = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(5, Number(searchParams.get("limit") ?? 20)));

  try {
    const activityFeed = await AliveEngine.getActivityFeed(limit);
    return NextResponse.json(
      { activityFeed },
      {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      }
    );
  } catch (err) {
    console.error("[api/alive/activity-feed]", err);
    return NextResponse.json({ error: "Failed to load activity feed" }, { status: 500 });
  }
}
