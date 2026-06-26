import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { searchPlayerEmails } from "@/lib/auth/security/adminSecurity";
import { searchPlayers } from "@/lib/search/searchPlayers";
import { requireCommandCenterAdmin } from "@/lib/platform/engines/commandCenter/apiAuth";

export const dynamic = "force-dynamic";

interface PlatformPlayerRow {
  email: string;
  displayName: string | null;
  slug: string | null;
  accountSuspended: boolean;
  securityFlagged: boolean;
  createdAt: string | null;
}

async function enrichPlayers(emails: string[]): Promise<PlatformPlayerRow[]> {
  if (!isSupabaseAdminConfigured() || emails.length === 0) return [];

  const supabase = getSupabaseAdmin();
  const normalized = emails.map((e) => e.toLowerCase());

  const [profilesRes, authRes] = await Promise.all([
    supabase
      .from("player_profiles")
      .select("email, display_name, slug, created_at")
      .in("email", normalized),
    supabase
      .from("player_auth_profiles")
      .select("email, account_suspended, security_flagged, created_at")
      .in("email", normalized),
  ]);

  const profileByEmail = new Map(
    (profilesRes.data ?? []).map((row) => [row.email as string, row])
  );
  const authByEmail = new Map(
    (authRes.data ?? []).map((row) => [row.email as string, row])
  );

  return emails.map((email) => {
    const key = email.toLowerCase();
    const profile = profileByEmail.get(key);
    const auth = authByEmail.get(key);
    return {
      email: key,
      displayName: (profile?.display_name as string | null) ?? null,
      slug: (profile?.slug as string | null) ?? null,
      accountSuspended: Boolean(auth?.account_suspended),
      securityFlagged: Boolean(auth?.security_flagged),
      createdAt:
        (profile?.created_at as string | null) ??
        (auth?.created_at as string | null) ??
        null,
    };
  });
}

export async function GET(request: Request) {
  const { error } = await requireCommandCenterAdmin("players");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const recent = Number(searchParams.get("recent") ?? "0");

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ players: [] });
  }

  try {
    if (q.length >= 2) {
      const [emailMatches, profileMatches] = await Promise.all([
        searchPlayerEmails(q, 15).catch(() => [] as string[]),
        searchPlayers(q, 15).catch(() => []),
      ]);

      const emails = new Set(emailMatches.map((e) => e.toLowerCase()));

      if (profileMatches.length > 0) {
        const supabase = getSupabaseAdmin();
        const slugs = profileMatches.map((p) => p.slug);
        const { data } = await supabase
          .from("player_profiles")
          .select("email")
          .in("slug", slugs);
        for (const row of data ?? []) {
          emails.add((row.email as string).toLowerCase());
        }
      }

      const players = await enrichPlayers(Array.from(emails).slice(0, 20));
      return NextResponse.json({ players });
    }

    if (recent > 0) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("player_profiles")
        .select("email")
        .order("created_at", { ascending: false })
        .limit(Math.min(recent, 50));

      const emails = (data ?? []).map((row) => row.email as string);
      const players = await enrichPlayers(emails);
      return NextResponse.json({ players });
    }

    return NextResponse.json({ players: [] });
  } catch (err) {
    console.error("[command-center/players]", err);
    return NextResponse.json({ error: "Failed to load players." }, { status: 500 });
  }
}
