import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPickemHistorySummary } from "@/lib/pickem/db/history";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to view history." }, { status: 401 });
  }

  try {
    const summary = await getPickemHistorySummary(user.email);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("[pickem/history]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load history." },
      { status: 500 }
    );
  }
}
