import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await SquarePassEngine.getDailySquarePass(auth);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[square-pass/automation/daily-bonus]", err);
    return NextResponse.json({ available: false });
  }
}
