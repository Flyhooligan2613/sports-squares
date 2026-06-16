import { NextRequest, NextResponse } from "next/server";
import { CommandCenterEngine } from "@/lib/platform/engines/commandCenter";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { error } = await requireCommandCenterAdmin("search");
  if (error) return error;

  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await CommandCenterEngine.search(q);
    return NextResponse.json({ results });
  } catch (err) {
    console.error("[command-center/search]", err);
    return NextResponse.json({ error: "Search failed." }, { status: 500 });
  }
}
