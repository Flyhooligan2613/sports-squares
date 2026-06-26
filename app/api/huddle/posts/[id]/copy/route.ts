import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { copyPickPost } from "@/lib/huddle/pickPosts";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return NextResponse.json({ error: "Sign in to copy picks." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { entryTierCents?: number };
    const result = await copyPickPost(user.email, id, body.entryTierCents ?? 1000);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "share") },
      { status: 400 }
    );
  }
}
