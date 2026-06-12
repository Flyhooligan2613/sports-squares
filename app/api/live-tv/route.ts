import { NextResponse } from "next/server";
import { getLiveTvData } from "@/lib/database/services/liveTv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getLiveTvData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[live-tv]", err);
    return NextResponse.json(
      { error: "Failed to load LIVE TV data." },
      { status: 500 }
    );
  }
}
