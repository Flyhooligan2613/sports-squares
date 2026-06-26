import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { claimPendingReward } from "@/lib/platform/ecosystem/pendingRewards";

export const dynamic = "force-dynamic";

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

  const body = (await request.json()) as { rewardId?: string };
  if (!body.rewardId) {
    return NextResponse.json({ error: "Reward id required." }, { status: 400 });
  }

  try {
    const result = await claimPendingReward(user.email, body.rewardId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = safeApiErrorMessage(err, "save");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
