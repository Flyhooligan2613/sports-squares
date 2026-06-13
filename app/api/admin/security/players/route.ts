import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { searchPlayerEmails } from "@/lib/auth/security/adminSecurity";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ players: [] });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) {
    return NextResponse.json({ players: [] });
  }

  const players = await searchPlayerEmails(query);
  return NextResponse.json({ players });
}
