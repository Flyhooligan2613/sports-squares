import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { importAllMarketplaceGames } from "@/lib/engines/gameEngine";
import { runBoardEngine } from "@/lib/engines/boardEngine";
import { verifyCronSecret } from "@/lib/cron/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  return runMarketplaceSync(request);
}

export async function POST(request: Request) {
  return runMarketplaceSync(request);
}

async function runMarketplaceSync(request: Request) {
  noStore();
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const gameResults = await importAllMarketplaceGames();
    const boardResult = await runBoardEngine();

    return NextResponse.json({
      ok: true,
      games: gameResults,
      boards: boardResult,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Marketplace sync failed.",
      },
      { status: 500 }
    );
  }
}
