import { NextResponse } from "next/server";
import { SquareWalletEngine, getWalletSummaryForLegacy } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

function zeroBalanceResponse() {
  return {
    ready: true,
    availableCents: 0,
    availableBalanceCents: 0,
    formattedAvailable: "$0.00",
    formatted: "$0.00",
  };
}

export async function GET() {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await SquareWalletEngine.ensureWallet(email);
    const summary = await getWalletSummaryForLegacy(email);
    const availableCents = summary.availableBalanceCents ?? 0;
    const formattedAvailable = `$${(availableCents / 100).toFixed(2)}`;

    return NextResponse.json({
      ready: true,
      availableCents,
      availableBalanceCents: availableCents,
      formattedAvailable,
      formatted: formattedAvailable,
    });
  } catch (err) {
    console.error("[square-wallet/balance]", err);
    return NextResponse.json(zeroBalanceResponse());
  }
}
