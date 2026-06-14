import { NextResponse } from "next/server";
import { mapLiveWinnersToActivity } from "@/lib/liveActivity/adapters/liveWinners";
import { createMockLiveActivitySeed } from "@/lib/liveActivity/mockData";
import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const mock = createMockLiveActivitySeed();

  try {
    const data = await getLiveWinnersCenterData();
    const live = mapLiveWinnersToActivity(data);
    const merged = [...live, ...mock].slice(0, 40);
    return NextResponse.json({
      source: live.length > 0 ? "rest" : "mock",
      events: merged,
      updatedAt: data.updatedAt,
    });
  } catch (err) {
    console.error("[live-activity]", err);
    return NextResponse.json({
      source: "mock",
      events: mock,
      updatedAt: new Date().toISOString(),
    });
  }
}
