import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as { referralCode?: string; deviceKey?: string };

    if (!body.referralCode?.trim()) {
      return NextResponse.json({ error: "Referral code required." }, { status: 400 });
    }

    await SquarePassEngine.applyReferral({
      refereeEmail: auth,
      referralCode: body.referralCode,
      deviceKey: body.deviceKey,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    });

    return NextResponse.json({ ok: true, message: "Referral connected." });
  } catch (err) {
    const message = safeApiErrorMessage(err, "redeem");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
