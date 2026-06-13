import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { listTrustedDevices } from "@/lib/auth/security/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ devices: [] });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deviceKey = new URL(request.url).searchParams.get("deviceKey")?.trim() ?? "";
  const devices = await listTrustedDevices(user.email);

  return NextResponse.json({
    devices: devices.map((device) => ({
      ...device,
      isCurrent: device.deviceKey === deviceKey,
    })),
  });
}
