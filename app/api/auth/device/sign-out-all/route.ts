import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { revokeAllTrustedDevices } from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

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

  const count = await revokeAllTrustedDevices(user.email);
  await supabase.auth.signOut({ scope: "global" });

  await notifySecurityEvent({
    email: user.email,
    eventType: "sign_out_all",
    metadata: { devicesRevoked: count },
  });

  return NextResponse.json({ ok: true, devicesRevoked: count });
}
