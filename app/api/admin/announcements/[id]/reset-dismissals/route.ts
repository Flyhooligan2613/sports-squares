import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { clearAnnouncementDismissals } from "@/lib/platform/announcements/db";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    await clearAnnouncementDismissals(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reset dismissals." },
      { status: 500 }
    );
  }
}
