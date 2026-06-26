import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { completePlayerSignIn } from "@/lib/auth/security/completeSignIn";
import { resolveClientIp, resolveLoginLocation } from "@/lib/auth/security/securityCenter";

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
    rememberMe?: boolean;
  };

  const deviceKey = body.deviceKey?.trim();
  if (!deviceKey) {
    return NextResponse.json({ error: "deviceKey required." }, { status: 400 });
  }

  const userAgent = request.headers.get("user-agent") ?? "unknown";

  try {
    const result = await completePlayerSignIn({
      email: user.email,
      authUserId: user.id,
      deviceKey,
      userAgent,
      rememberMe: body.rememberMe,
      lastLocation: resolveLoginLocation(request.headers),
      lastIp: resolveClientIp(request.headers),
    });

    return NextResponse.json({
      ok: true,
      device: result.device,
      isNewDevice: result.isNewDevice,
    });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "generic") },
      { status: 500 }
    );
  }
}
