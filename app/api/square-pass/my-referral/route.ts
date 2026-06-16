import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await SquarePassEngine.getMyReferral(auth);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[square-pass/my-referral]", err);
    return NextResponse.json({ error: "Failed to load referral data." }, { status: 500 });
  }
}
