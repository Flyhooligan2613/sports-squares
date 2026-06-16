import { NextResponse } from "next/server";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";
import { SquarePassEngine } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error, role } = await requireCommandCenterAdmin("analytics");
  if (error) return error;

  try {
    const analytics = await SquarePassEngine.getAnalytics();
    return NextResponse.json({ analytics, role });
  } catch (err) {
    console.error("[admin/square-pass/analytics]", err);
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 500 });
  }
}

export async function POST() {
  const { error } = await requireCommandCenterAdmin("analytics");
  if (error) return error;

  try {
    const result = await SquarePassEngine.runScheduler();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[admin/square-pass/scheduler]", err);
    return NextResponse.json({ error: "Scheduler failed." }, { status: 500 });
  }
}
