import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refreshPlayerConnectStatus } from "@/lib/database/services/stripeConnect";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Payout refresh unavailable." },
      { status: 503 }
    );
  }

  try {
    const status = await refreshPlayerConnectStatus(user.email);
    return NextResponse.json(status);
  } catch (err) {
    console.error("[connect/refresh]", err);
    return NextResponse.json(
      { error: "Failed to refresh payout status." },
      { status: 500 }
    );
  }
}
