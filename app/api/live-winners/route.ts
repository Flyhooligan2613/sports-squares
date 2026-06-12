import { NextResponse } from "next/server";
import { getLiveWinnersCenterData } from "@/lib/database/services/liveWinnersCenter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getLiveWinnersCenterData();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[live-winners]", err);
    return NextResponse.json(
      { error: "Failed to load live winners data." },
      { status: 500 }
    );
  }
}
