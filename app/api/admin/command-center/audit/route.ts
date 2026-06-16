import { NextRequest, NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("audit");
  if (error) return error;

  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "100");
  const eventType = request.nextUrl.searchParams.get("eventType") ?? undefined;

  try {
    const entries = await CommandCenterEngine.getAuditLog({
      limit: Math.min(200, Math.max(1, limit)),
      eventType,
    });
    return NextResponse.json({ entries });
  } catch (err) {
    console.error("[command-center/audit]", err);
    return NextResponse.json({ error: "Failed to load audit log." }, { status: 500 });
  }
}
