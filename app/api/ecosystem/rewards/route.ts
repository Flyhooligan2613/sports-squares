import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { listRewardsCatalog, redeemReward } from "@/lib/platform/ecosystem/rewards";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ catalog: [] });
  }

  return NextResponse.json({ catalog: await listRewardsCatalog() });
}

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { catalogItemId?: string };
  if (!body.catalogItemId) {
    return NextResponse.json({ error: "Reward item required." }, { status: 400 });
  }

  const result = await redeemReward({
    email: user.email,
    catalogItemId: body.catalogItemId,
  });

  return NextResponse.json({ ok: true, ...result });
}
