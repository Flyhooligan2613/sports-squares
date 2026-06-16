import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const bonuses = await SquarePassEngine.processSignupBonuses(auth);
    return NextResponse.json({ bonuses });
  } catch (err) {
    console.error("[square-pass/signup-bonus]", err);
    return NextResponse.json({ bonuses: [] });
  }
}
