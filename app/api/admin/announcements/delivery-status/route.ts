import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  listAllAnnouncements,
  listScheduledAnnouncements,
} from "@/lib/platform/announcements/db";
import { getActiveAnnouncementsForViewer } from "@/lib/platform/announcements/resolver";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const configured = isSupabaseAdminConfigured();

  if (!configured) {
    return NextResponse.json({
      configured: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is missing on this server — announcements cannot load on the public site.",
      scheduledCount: 0,
      publicAnonymousCount: 0,
      publicAnonymousPopups: 0,
    });
  }

  try {
    const [all, scheduled, publicAnonymous] = await Promise.all([
      listAllAnnouncements(),
      listScheduledAnnouncements(),
      getActiveAnnouncementsForViewer({
        email: null,
        anonymousId: "delivery-preview",
        region: null,
      }),
    ]);

    const popups = publicAnonymous.filter((a) => a.displayType === "welcome_popup");

    return NextResponse.json({
      configured: true,
      totalCount: all.length,
      scheduledCount: scheduled.length,
      publicAnonymousCount: publicAnonymous.length,
      publicAnonymousPopups: popups.length,
      scheduled: scheduled.map((a) => ({
        id: a.id,
        title: a.title,
        displayType: a.displayType,
        audience: a.audience,
        startsAt: a.startsAt,
        endsAt: a.endsAt,
      })),
      delivering: publicAnonymous.map((a) => ({
        id: a.id,
        title: a.title,
        displayType: a.displayType,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        configured: true,
        error: err instanceof Error ? err.message : "Delivery check failed.",
      },
      { status: 500 }
    );
  }
}
