import { NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireCommandCenterAdmin("health");
  if (error) return error;

  try {
    const health = await CommandCenterEngine.getSystemHealth();
    return NextResponse.json({ health });
  } catch (err) {
    console.error("[command-center/health]", err);
    return NextResponse.json({ error: "Failed to load health report." }, { status: 500 });
  }
}
