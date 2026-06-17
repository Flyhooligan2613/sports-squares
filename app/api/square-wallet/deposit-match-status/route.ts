import { NextResponse } from "next/server";
import { hasCompletedFirstDeposit } from "@/lib/platform/engines/payment/wallet/DepositBonusService";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";
import { isLiveTrialBannerEnabled } from "@/lib/platform/liveTrial";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isLiveTrialBannerEnabled()) {
    return NextResponse.json({ eligible: false, reason: "disabled" });
  }

  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ eligible: false, reason: "unauthenticated" }, { status: 401 });
  }

  try {
    const deposited = await hasCompletedFirstDeposit(email);
    return NextResponse.json({ eligible: !deposited });
  } catch (err) {
    console.error("[square-wallet/deposit-match-status]", err);
    return NextResponse.json({ eligible: false, reason: "error" });
  }
}
