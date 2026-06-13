import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { listRewardsCatalog } from "@/lib/platform/ecosystem/rewards";
import { getAdminConfig, setAdminConfig } from "@/lib/platform/ecosystem/adminConfig";
import { listTierDefinitions } from "@/lib/platform/ecosystem/tiers";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ catalog: [], tiers: [] });

  const [catalog, tiers, referral, tierCredits, mysteryBox] = await Promise.all([
    listRewardsCatalog(),
    listTierDefinitions(),
    getAdminConfig("referral"),
    getAdminConfig("tier_credits"),
    getAdminConfig("mystery_box"),
  ]);

  return NextResponse.json({ catalog, tiers, referral, tierCredits, mysteryBox });
}

export async function PATCH(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = (await request.json()) as {
    key?: "referral" | "tier_credits" | "mystery_box" | "username" | "game_status";
    value?: Record<string, unknown>;
  };

  if (!body.key || !body.value) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  await setAdminConfig(body.key, body.value as never);
  return NextResponse.json({ ok: true });
}
