import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { verifyAuthentication } from "@/lib/auth/security/webauthn";
import { issueStepUpToken } from "@/lib/auth/security/stepUp";

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

  const body = (await request.json()) as {
    deviceKey?: string;
    response?: unknown;
    purpose?: "payout_change" | "email_change" | "account_delete" | "view_financials" | "purchase" | "profile_update" | "password_change" | "phone_change";
  };

  const deviceKey = body.deviceKey?.trim();
  const purpose = body.purpose ?? "payout_change";

  if (!deviceKey || !body.response) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await verifyAuthentication({
      email: user.email,
      deviceKey,
      response: body.response as Parameters<typeof verifyAuthentication>[0]["response"],
    });

    const token = await issueStepUpToken(user.email, purpose);
    return NextResponse.json({ ok: true, stepUpToken: token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Confirmation failed." },
      { status: 401 }
    );
  }
}
