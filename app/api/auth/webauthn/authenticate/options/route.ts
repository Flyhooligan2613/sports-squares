import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createAuthenticationOptions } from "@/lib/auth/security/webauthn";
import { playerEmailHasPurchases } from "@/lib/auth/playerMagicLink";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const body = (await request.json()) as { email?: string; deviceKey?: string };
  const email = body.email?.trim().toLowerCase();
  const deviceKey = body.deviceKey?.trim();

  if (!email || !deviceKey) {
    return NextResponse.json({ error: "email and deviceKey required." }, { status: 400 });
  }

  const hasPurchases = await playerEmailHasPurchases(email);
  if (!hasPurchases) {
    return NextResponse.json({ error: "No account found for this email." }, { status: 404 });
  }

  try {
    const options = await createAuthenticationOptions({ email, deviceKey });
    return NextResponse.json({ options });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "generic") },
      { status: 400 }
    );
  }
}
