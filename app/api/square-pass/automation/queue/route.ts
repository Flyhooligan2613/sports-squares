import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await SquarePassEngine.getAutomationQueue(auth);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[square-pass/automation/queue]", err);
    return NextResponse.json({ queue: [], state: {} });
  }
}
