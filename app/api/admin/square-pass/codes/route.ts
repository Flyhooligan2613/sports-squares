import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { SquarePassEngine } from "@/lib/platform/engines/squarePass";
import type { CreateCodeInput } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as CreateCodeInput;
    if (!body.code?.trim() || !body.campaignId) {
      return NextResponse.json({ error: "code and campaignId are required." }, { status: 400 });
    }

    const code = await SquarePassEngine.createCode(body);
    return NextResponse.json({ code });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
