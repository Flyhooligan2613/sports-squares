import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { claimPromotion, listActivePromotions } from "@/lib/platform/ecosystem/promotions";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const promotions = await listActivePromotions(user.email);
  return NextResponse.json({ promotions });
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

  const body = (await request.json()) as { promotionId?: string };
  if (!body.promotionId) {
    return NextResponse.json({ error: "promotionId required." }, { status: 400 });
  }

  try {
    await claimPromotion(user.email, body.promotionId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = safeApiErrorMessage(err, "save");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
