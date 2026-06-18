import { NextResponse } from "next/server";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";
import { AliveEngine } from "@/lib/platform/alive";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const walletInsights = await AliveEngine.getWalletInsights(email);
    return NextResponse.json({ walletInsights });
  } catch (err) {
    console.error("[api/alive/wallet-insights]", err);
    return NextResponse.json({ walletInsights: [] });
  }
}
