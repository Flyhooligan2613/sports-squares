import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { buildSurvivorHallOfFameView } from "@/lib/survivor/db/hof";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  noStore();
  const { searchParams } = new URL(request.url);
  const seasonYearParam = searchParams.get("seasonYear");
  const seasonYear = seasonYearParam
    ? parseInt(seasonYearParam, 10)
    : new Date().getFullYear();

  try {
    const view = await buildSurvivorHallOfFameView(seasonYear);
    return NextResponse.json(view);
  } catch (err) {
    console.error("[survivor/hall-of-fame]", err);
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}
