import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  getAnnouncementAnalytics,
  listAnnouncementTemplates,
  upsertAnnouncementTemplate,
} from "@/lib/platform/announcements/db";
import { BUILTIN_ANNOUNCEMENT_PRESETS } from "@/lib/platform/announcements/templates/presets";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AnnouncementUpsertInput } from "@/lib/platform/announcements/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ presets: BUILTIN_ANNOUNCEMENT_PRESETS, saved: [] });
  }

  try {
    const saved = await listAnnouncementTemplates();
    return NextResponse.json({ presets: BUILTIN_ANNOUNCEMENT_PRESETS, saved });
  } catch {
    return NextResponse.json({ presets: BUILTIN_ANNOUNCEMENT_PRESETS, saved: [] });
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

  const body = (await request.json()) as {
    name?: string;
    description?: string;
    payload?: AnnouncementUpsertInput;
  };

  if (!body.name?.trim() || !body.payload?.title?.trim()) {
    return NextResponse.json({ error: "Name and announcement title are required." }, { status: 400 });
  }

  const slug = body.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  try {
    const template = await upsertAnnouncementTemplate({
      slug,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      payload: body.payload,
    });
    return NextResponse.json({ template });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save template." },
      { status: 500 }
    );
  }
}
