import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { createAnnouncement, listAllAnnouncements } from "@/lib/platform/announcements/db";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AnnouncementUpsertInput } from "@/lib/platform/announcements/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ announcements: [] });
  }

  try {
    const announcements = await listAllAnnouncements();
    return NextResponse.json({ announcements });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const body = (await request.json()) as AnnouncementUpsertInput;

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  try {
    const announcement = await createAnnouncement(body, admin.email ?? "admin");
    await logPlatformAudit({
      eventType: "announcement.published",
      summary: `Published announcement: ${announcement.title}`,
      entityType: "announcement",
      entityId: announcement.id,
      actorEmail: admin.email,
      actorRole: "admin",
      metadata: {
        displayType: announcement.displayType,
        audience: announcement.audience,
      },
    });
    return NextResponse.json({ announcement });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Create failed." },
      { status: 500 }
    );
  }
}
