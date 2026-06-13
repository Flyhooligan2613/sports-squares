import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createRegistrationOptions, deviceHasPasskey } from "@/lib/auth/security/webauthn";

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

  const body = (await request.json()) as { deviceKey?: string; deviceName?: string };
  const deviceKey = body.deviceKey?.trim();
  if (!deviceKey) {
    return NextResponse.json({ error: "deviceKey required." }, { status: 400 });
  }

  try {
    if (await deviceHasPasskey(user.email, deviceKey)) {
      return NextResponse.json({ ok: true, alreadyEnabled: true });
    }

    const options = await createRegistrationOptions({
      email: user.email,
      deviceKey,
      deviceName: body.deviceName?.trim() || "This device",
    });
    return NextResponse.json({ options });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start biometric setup." },
      { status: 500 }
    );
  }
}
