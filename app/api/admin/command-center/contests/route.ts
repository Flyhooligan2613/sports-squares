import { NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("contests");
  if (error) return error;

  try {
    const summary = await CommandCenterEngine.getContestOperationsSummary();
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[command-center/contests]", err);
    return NextResponse.json({ error: "Failed to load contest operations." }, { status: 500 });
  }
}
