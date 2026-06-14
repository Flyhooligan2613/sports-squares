import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { loadPoolHighlights } from "@/lib/highlight/service";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { poolId: string } }
) {
  noStore();

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ highlights: [] });
  }

  try {
    const highlights = await loadPoolHighlights(params.poolId);
    return NextResponse.json({ highlights });
  } catch (err) {
    return NextResponse.json(
      {
        highlights: [],
        error: err instanceof Error ? err.message : "Failed to load highlights.",
      },
      { status: 200 }
    );
  }
}
