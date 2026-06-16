import { NextResponse } from "next/server";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await SquareWalletEngine.ensureWallet(email);
    const dashboard = await SquareWalletEngine.getDashboard(email);
    return NextResponse.json({ dashboard });
  } catch (err) {
    console.error("[square-wallet/dashboard]", err);
    return NextResponse.json({ dashboard: null });
  }
}
