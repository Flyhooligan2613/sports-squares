import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getActiveAnnouncementsForViewer } from "@/lib/platform/announcements/resolver";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function resolveRegion(h: Headers): string | null {
  const country = h.get("x-vercel-ip-country");
  const region = h.get("x-vercel-ip-country-region");
  if (country && region) return `${country}-${region}`;
  if (country) return country;
  return null;
}

export async function GET(request: Request) {
  noStore();

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ announcements: [] });
  }

  const { searchParams } = new URL(request.url);
  const anonymousId = searchParams.get("anonymousId");
  const displayType = searchParams.get("displayType");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const h = await headers();

  try {
    const announcements = await getActiveAnnouncementsForViewer({
      email: user?.email ?? null,
      anonymousId,
      region: resolveRegion(h),
      displayType: displayType as Parameters<
        typeof getActiveAnnouncementsForViewer
      >[0]["displayType"],
    });

    return NextResponse.json({ announcements });
  } catch (err) {
    console.error("[platform/messages]", err);
    return NextResponse.json({ announcements: [] });
  }
}
