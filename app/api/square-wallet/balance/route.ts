import { NextResponse } from "next/server";
import { SquareWalletEngine, getWalletSummaryForLegacy } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await SquareWalletEngine.ensureWallet(email);
    const summary = await getWalletSummaryForLegacy(email);
    const availableCents = summary.availableBalanceCents;

    return NextResponse.json({
      ready: true,
      availableCents,
      formattedAvailable: `$${(availableCents / 100).toFixed(2)}`,
    });
  } catch (err) {
    console.error("[square-wallet/balance]", err);
    return NextResponse.json({
      ready: false,
      availableCents: 0,
      formattedAvailable: null,
    });
  }
}
