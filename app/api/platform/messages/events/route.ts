import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recordAnnouncementEvents } from "@/lib/platform/announcements/db";
import { buildViewerKey } from "@/lib/platform/announcements/targeting";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AnnouncementEventType } from "@/lib/platform/announcements/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as {
    announcementId?: string;
    anonymousId?: string | null;
    eventTypes?: AnnouncementEventType[];
  };

  if (!body.announcementId || !body.eventTypes?.length) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewerKey = buildViewerKey(user?.email ?? null, body.anonymousId ?? null);

  try {
    await recordAnnouncementEvents({
      announcementId: body.announcementId,
      viewerKey,
      eventTypes: body.eventTypes,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
