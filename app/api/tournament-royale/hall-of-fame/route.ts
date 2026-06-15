import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("tournament_royale_hof_entries")
      .select("*")
      .order("inducted_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      entries: (data ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name,
        category: row.category,
        seasonYear: row.season_year,
        detail: row.detail,
        inductedAt: row.inducted_at,
      })),
    });
  } catch (err) {
    console.error("[tournament-royale/hall-of-fame]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load Hall of Fame." },
      { status: 500 }
    );
  }
}
