import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSquareWalletAuthorizedEmail } from "@/lib/platform/engines/payment/wallet/apiAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const email = await getSquareWalletAuthorizedEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { ledgerId?: string };
  if (!body.ledgerId?.trim()) {
    return NextResponse.json({ error: "Ledger entry required." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: entry } = await supabase
    .from("square_wallet_ledger_entries")
    .select("metadata, player_email")
    .eq("id", body.ledgerId)
    .maybeSingle();

  if (!entry || entry.player_email !== email) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const metadata = { ...((entry.metadata as Record<string, unknown>) ?? {}), celebrated: true };
  await supabase
    .from("square_wallet_ledger_entries")
    .update({ metadata })
    .eq("id", body.ledgerId);

  return NextResponse.json({ ok: true });
}
