import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { SquarePassEngine, getSquarePassAuthorizedEmail } from "@/lib/platform/engines/squarePass";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getSquarePassAuthorizedEmail();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await request.json()) as {
      code?: string;
      deviceKey?: string;
      region?: string;
      sport?: string;
    };

    if (!body.code?.trim()) {
      return NextResponse.json({ error: "Enter a promo code." }, { status: 400 });
    }

    const result = await SquarePassEngine.redeemCode({
      email: auth,
      code: body.code,
      deviceKey: body.deviceKey,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      region: body.region ?? null,
      sport: body.sport ?? null,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = safeApiErrorMessage(err, "redeem");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
