import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import {
  changeUsername,
  getUsernameChangeEligibility,
} from "@/lib/platform/ecosystem/username";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getUsernameChangeEligibility(user.email));
}

export async function PATCH(request: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { username?: string };
  if (!body.username?.trim()) {
    return NextResponse.json({ error: "Username required." }, { status: 400 });
  }

  try {
    await changeUsername({ email: user.email, username: body.username });
    return NextResponse.json({
      ok: true,
      ...(await getUsernameChangeEligibility(user.email)),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update username.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
