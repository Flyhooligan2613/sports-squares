import { safeApiErrorMessage } from "@/lib/errors/formatUserError";
import { NextResponse } from "next/server";
import {
  listSupportMessages,
  replyToSupportThread,
} from "@/lib/database/services/supportMessages";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = await listSupportMessages(params.threadId, user.email);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "load") },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "Support unavailable." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { message?: string };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    await replyToSupportThread({
      threadId: params.threadId,
      email: user.email,
      body: message,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: safeApiErrorMessage(err, "generic") },
      { status: 500 }
    );
  }
}
