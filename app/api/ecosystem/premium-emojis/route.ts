import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  getPremiumEmojiShopState,
  purchasePremiumEmojiWithWallet,
} from "@/lib/platform/ecosystem/premiumEmojis";
import { PLAYER_AVATARS } from "@/lib/platform/ecosystem/avatars";

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

  const state = await getPremiumEmojiShopState(user.email);
  return NextResponse.json(state);
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

  const body = (await request.json()) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ error: "Premium emoji slug required." }, { status: 400 });
  }

  try {
    const result = await purchasePremiumEmojiWithWallet({
      email: user.email,
      slug: body.slug,
    });
    const state = await getPremiumEmojiShopState(user.email);
    return NextResponse.json({
      ok: true,
      ...result,
      ownedSlugs: state.ownedSlugs,
      ownedEmojis: state.ownedEmojis,
      walletAvailableCents: state.walletAvailableCents,
      freeOptions: PLAYER_AVATARS,
    });
  } catch (err) {
    const message = safeApiErrorMessage(err, "checkout");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
