import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  acknowledgeTrustedDevice,
  renameTrustedDevice,
  revokeTrustedDevice,
} from "@/lib/auth/security/db";
import { notifySecurityEvent } from "@/lib/auth/security/notify";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
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

  const body = (await request.json()) as {
    customName?: string;
    acknowledge?: boolean;
  };

  if (body.acknowledge) {
    await acknowledgeTrustedDevice(user.email, id);
    await notifySecurityEvent({
      email: user.email,
      eventType: "device_acknowledged",
      metadata: { deviceId: id },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.customName !== undefined) {
    await renameTrustedDevice(user.email, id, body.customName);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
}

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
