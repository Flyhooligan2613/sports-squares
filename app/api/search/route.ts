import { NextResponse } from "next/server";
import { filterAppActions } from "@/lib/search/appActions";
import { searchPlayers } from "@/lib/search/searchPlayers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user?.email);

  const actions = filterAppActions(q, isSignedIn, 10);

  try {
    const players = q.length >= 2 ? await searchPlayers(q, 8) : [];
    return NextResponse.json({ query: q, actions, players });
  } catch (err) {
    console.error("[search]", err);
    return NextResponse.json(
      { query: q, actions, players: [], error: "Player search unavailable." },
      { status: 200 }
    );
  }
}
