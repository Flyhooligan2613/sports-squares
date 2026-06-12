import { NextResponse } from "next/server";
import { getUnreadSupportCount } from "@/lib/database/services/supportMessages";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ count: 0 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await getUnreadSupportCount(user.email);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
