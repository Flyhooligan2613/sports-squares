import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { acknowledgeTrustedDevice, revokeAllTrustedDevices } from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

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
    deviceId?: string;
    action?: "acknowledge" | "secure_account";
  };

  if (body.action === "acknowledge" && body.deviceId) {
    await acknowledgeTrustedDevice(user.email, body.deviceId);
    await notifySecurityEvent({
      email: user.email,
      eventType: "device_acknowledged",
      metadata: { deviceId: body.deviceId },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "secure_account") {
    await revokeAllTrustedDevices(user.email);
    await notifySecurityEvent({
      email: user.email,
      eventType: "account_secured",
    });
    await notifySecurityEvent({
      email: user.email,
      eventType: "sign_out_all",
    });
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true, signedOut: true });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
