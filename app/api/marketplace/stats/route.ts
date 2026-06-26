import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { getMarketplaceTotals } from "@/lib/marketplace/listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  noStore();

  try {
    const totals = await getMarketplaceTotals();
    return NextResponse.json(totals);
  } catch (err) {
    return NextResponse.json(
      {
        sports: [],
        totalGames: 0,
        totalOpenBoards: 0,
        totalSquaresAvailable: 0,
        error:
          safeApiErrorMessage(err, "load"),
      },
      { status: 200 }
    );
  }
}
