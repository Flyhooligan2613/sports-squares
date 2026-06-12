import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlayerConnectStatus } from "@/lib/database/services/stripeConnect";
import { isStripeConnectEnabled } from "@/lib/stripe/connect";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
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
      { error: "Payout status unavailable." },
      { status: 503 }
    );
  }

  try {
    const status = await getPlayerConnectStatus(user.email);
    return NextResponse.json({
      ...status,
      connectEnabled: isStripeConnectEnabled(),
    });
  } catch (err) {
    console.error("[connect/status]", err);
    return NextResponse.json(
      { error: "Failed to load payout status." },
      { status: 500 }
    );
  }
}
