import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { recordSecurityEvent } from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";
import {
  resolveClientIp,
  resolveLoginLocation,
} from "@/lib/auth/security/securityCenter";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
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

  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();

  if (!password || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: safeApiErrorMessage(error, "generic") }, { status: 400 });
  }

  await notifySecurityEvent({
    email: user.email,
    eventType: "password_change",
    metadata: {
      location: resolveLoginLocation(request.headers) ?? undefined,
      ip: resolveClientIp(request.headers) ?? undefined,
    },
  }).catch(() => undefined);

  await recordSecurityEvent({
    email: user.email,
    eventType: "password_change",
    metadata: {
      location: resolveLoginLocation(request.headers),
    },
  }).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
