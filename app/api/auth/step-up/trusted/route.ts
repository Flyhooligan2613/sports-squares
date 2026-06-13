import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { isTrustedDevice } from "@/lib/auth/security/db";
import { issueStepUpToken, type StepUpPurpose } from "@/lib/auth/security/stepUp";
import { recordSecurityEvent } from "@/lib/auth/security/db";

export const dynamic = "force-dynamic";

const VALID_PURPOSES: StepUpPurpose[] = [
  "payout_change",
  "email_change",
  "account_delete",
  "view_financials",
  "purchase",
  "profile_update",
  "password_change",
  "phone_change",
];

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
    purpose?: StepUpPurpose;
  };

  const deviceKey = body.deviceKey?.trim();
  const purpose = body.purpose ?? "purchase";

  if (!deviceKey || !VALID_PURPOSES.includes(purpose)) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const trusted = await isTrustedDevice(user.email, deviceKey);
  if (!trusted) {
    return NextResponse.json({ error: "Device not trusted." }, { status: 403 });
  }

  await recordSecurityEvent({
    email: user.email,
    eventType: "pin_login",
    metadata: { purpose, method: "trusted_unlock" },
  });

  const token = await issueStepUpToken(user.email, purpose);
  return NextResponse.json({ ok: true, stepUpToken: token });
}
