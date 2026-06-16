import { NextResponse } from "next/server";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recommendations = await SquareWalletEngine.getSmartRecommendations(email);
  return NextResponse.json({ recommendations });
}
