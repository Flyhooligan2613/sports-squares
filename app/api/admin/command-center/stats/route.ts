import { NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, role } = await requireCommandCenterAdmin("dashboard");
  if (error) return error;

  try {
    const stats = await CommandCenterEngine.getDashboardStats();
    return NextResponse.json({ stats, role });
  } catch (err) {
    console.error("[command-center/stats]", err);
    return NextResponse.json({ error: "Failed to load stats." }, { status: 500 });
  }
}
