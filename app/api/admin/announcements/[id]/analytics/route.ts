import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { getAnnouncementAnalytics } from "@/lib/platform/announcements/db";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ analytics: null }, { status: 503 });
  }

  const { id } = await context.params;

  try {
    const analytics = await getAnnouncementAnalytics(id);
    return NextResponse.json({ analytics });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Analytics unavailable." },
      { status: 500 }
    );
  }
}
