import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { openWeeklyRewardDrop } from "@/lib/platform/ecosystem/weeklyRewardDrop";

export const dynamic = "force-dynamic";

export async function POST() {
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

  try {
    const { drop } = await openWeeklyRewardDrop(user.email);
    return NextResponse.json({ ok: true, rewards: drop.rewards, drop });
  } catch (err) {
    const message = safeApiErrorMessage(err, "redeem");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
