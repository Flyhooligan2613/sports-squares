import { NextResponse } from "next/server";
import { SquareWalletEngine } from "@/lib/platform/engines/payment/wallet";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { year?: number; format?: "csv" | "json" };
  const result = await SquareWalletEngine.exportTransactions({
    email,
    year: body.year,
    format: body.format ?? "csv",
  });

  return NextResponse.json(result);
}
