import { NextResponse } from "next/server";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = enforceRateLimit("wallet:deposit", email, RATE_LIMITS.wallet);
  if (rateLimited) return rateLimited;

  const body = (await request.json()) as { amountCents?: number; returnPath?: string };
  const amountCents = Math.floor(Number(body.amountCents));
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Enter a valid deposit amount." }, { status: 400 });
  }

  const result = await SquareWalletEngine.initiateDeposit({
    email,
    amountCents,
    returnPath: body.returnPath,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Deposit failed." }, { status: 400 });
  }

  return NextResponse.json({ checkoutUrl: result.checkoutUrl, sessionId: result.sessionId });
}
