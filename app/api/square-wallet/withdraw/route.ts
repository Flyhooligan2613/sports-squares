import { NextResponse } from "next/server";
import { requireStepUpFromRequest } from "@/lib/auth/security/stepUp";
import { emailHasPasskey } from "@/lib/auth/security/webauthn";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimited = enforceRateLimit("wallet:withdraw", email, RATE_LIMITS.wallet);
  if (rateLimited) return rateLimited;

  const stepUp = await requireStepUpFromRequest(request, "payout_change");
  const hasPasskey = await emailHasPasskey(email);
  if (hasPasskey && !stepUp.ok) {
    return NextResponse.json({ error: stepUp.error, requiresStepUp: true }, { status: 403 });
  }

  const body = (await request.json()) as { amountCents?: number; poolId?: string };
  const amountCents = Math.floor(Number(body.amountCents));
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: "Enter a valid withdrawal amount." }, { status: 400 });
  }

  const result = await SquareWalletEngine.requestWithdrawal({
    email,
    amountCents,
    poolId: body.poolId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Withdrawal failed." }, { status: 400 });
  }

  return NextResponse.json(result);
}
