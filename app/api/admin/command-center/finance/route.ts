import { NextResponse } from "next/server";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("finance");
  if (error) return error;

  try {
    const summary = await CommandCenterEngine.getFinancialHealthSummary();
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[command-center/finance]", err);
    return NextResponse.json({ error: "Failed to load financial health." }, { status: 500 });
  }
}
