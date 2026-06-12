import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  deleteAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "@/lib/platform/announcements/db";
import { logPlatformAudit } from "@/lib/platform/core/auditLog";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AnnouncementUpsertInput } from "@/lib/platform/announcements/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<AnnouncementUpsertInput>;

  try {
    const existing = await getAnnouncementById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const announcement = await updateAnnouncement(id, body);
    await logPlatformAudit({
      eventType: "announcement.updated",
      summary: `Updated announcement: ${announcement.title}`,
      entityType: "announcement",
      entityId: announcement.id,
      actorEmail: admin.email,
      actorRole: "admin",
    });
    return NextResponse.json({ announcement });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    const existing = await getAnnouncementById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    await deleteAnnouncement(id);
    await logPlatformAudit({
      eventType: "announcement.deleted",
      summary: `Deleted announcement: ${existing.title}`,
      entityType: "announcement",
      entityId: id,
      actorEmail: admin.email,
      actorRole: "admin",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 }
    );
  }
}
