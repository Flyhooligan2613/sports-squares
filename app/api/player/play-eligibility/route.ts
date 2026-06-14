import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getPlayEligibility } from "@/lib/payments/playEligibility";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ eligible: false, blockers: ["payout_account_required"] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({
      eligible: false,
      blockers: ["sign_in_required"],
      setupUrl: "/my-games/login",
    });
  }

  try {
    const status = await getPlayEligibility(user.email);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[play-eligibility]", err);
    return NextResponse.json(
      { error: "Could not verify play eligibility." },
      { status: 500 }
    );
  }
}
