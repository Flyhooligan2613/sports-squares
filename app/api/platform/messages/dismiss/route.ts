import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dismissAnnouncement } from "@/lib/platform/announcements/db";
import { buildViewerKey } from "@/lib/platform/announcements/targeting";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const body = (await request.json()) as {
    announcementId?: string;
    anonymousId?: string;
  };

  if (!body.announcementId) {
    return NextResponse.json({ error: "announcementId required." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewerKey = buildViewerKey(user?.email ?? null, body.anonymousId ?? null);

  try {
    await dismissAnnouncement({
      announcementId: body.announcementId,
      viewerKey,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "generic") },
      { status: 500 }
    );
  }
}
