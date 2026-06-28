import { NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { getDemoDashboardStats } from "@/lib/platform/engines/commandCenter/mockStats";
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
    const stats = getDemoDashboardStats("Live stats failed — showing demo fallback.");
    return NextResponse.json({ stats, role, demo: true });
  }
}
