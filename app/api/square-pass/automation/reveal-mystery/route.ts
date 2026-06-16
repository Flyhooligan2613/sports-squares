import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await SquarePassEngine.revealMysterySquarePass(auth);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[square-pass/automation/reveal-mystery]", err);
    return NextResponse.json({ error: "Could not reveal mystery reward." }, { status: 500 });
  }
}
