import { NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, role } = await requireCommandCenterAdmin("executive");
  if (error) return error;

  try {
    const summary = await CommandCenterEngine.getExecutiveSummary();
    return NextResponse.json({ summary, role });
  } catch (err) {
    console.error("[command-center/executive]", err);
    return NextResponse.json({ error: "Failed to load executive summary." }, { status: 500 });
  }
}
