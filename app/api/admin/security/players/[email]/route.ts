import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  adminForceLogoutPlayer,
  adminRevokePlayerDevice,
  adminSetPlayerSecurityFlags,
  getAdminPlayerSecuritySummary,
} from "@/lib/auth/security/adminSecurity";
import { securityEventLabel } from "@/lib/auth/security/securityCenter";
import { normalizeEmail } from "@/lib/player/statsCore";

export const dynamic = "force-dynamic";

function decodeEmailParam(raw: string): string {
  return normalizeEmail(decodeURIComponent(raw));
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { email: rawEmail } = await context.params;
  const summary = await getAdminPlayerSecuritySummary(decodeEmailParam(rawEmail));

  if (!summary) {
    return NextResponse.json({ error: "Player not found." }, { status: 404 });
  }

  return NextResponse.json({
    ...summary,
    recentEvents: summary.recentEvents.map((event) => ({
      ...event,
      label: securityEventLabel(event.eventType),
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const { email: rawEmail } = await context.params;
  const email = decodeEmailParam(rawEmail);
  const body = (await request.json()) as {
    action?: "force_logout" | "revoke_device" | "suspend" | "unsuspend" | "flag" | "unflag";
    deviceId?: string;
  };

  switch (body.action) {
    case "force_logout":
      await adminForceLogoutPlayer(email, admin.email);
      break;
    case "revoke_device":
      if (!body.deviceId) {
        return NextResponse.json({ error: "deviceId required." }, { status: 400 });
      }
      await adminRevokePlayerDevice(email, body.deviceId, admin.email);
      break;
    case "suspend":
      await adminSetPlayerSecurityFlags({
        email,
        suspended: true,
        adminEmail: admin.email,
      });
      break;
    case "unsuspend":
      await adminSetPlayerSecurityFlags({
        email,
        suspended: false,
        adminEmail: admin.email,
      });
      break;
    case "flag":
      await adminSetPlayerSecurityFlags({
        email,
        flagged: true,
        adminEmail: admin.email,
      });
      break;
    case "unflag":
      await adminSetPlayerSecurityFlags({
        email,
        flagged: false,
        adminEmail: admin.email,
      });
      break;
    default:
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const summary = await getAdminPlayerSecuritySummary(email);
  return NextResponse.json({ ok: true, summary });
}
