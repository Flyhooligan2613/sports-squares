import { NextResponse } from "next/server";
import { AliveEngine } from "@/lib/platform/alive";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  try {
    const [platformPulse, communityPresence] = await Promise.all([
      AliveEngine.getPlatformPulse(),
      AliveEngine.getCommunityPresence(),
    ]);
    return NextResponse.json(
      { platformPulse, communityPresence },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("[api/alive/platform-pulse]", err);
    return NextResponse.json({ error: "Failed to load platform pulse" }, { status: 500 });
  }
}
