import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, getSupabaseAdmin } from "@/lib/supabase/admin";
import { revokeTrustedDevice } from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await revokeTrustedDevice(user.email, id);
  await notifySecurityEvent({
    email: user.email,
    eventType: "device_revoked",
    metadata: { deviceId: id },
  });

  return NextResponse.json({ ok: true });
}
