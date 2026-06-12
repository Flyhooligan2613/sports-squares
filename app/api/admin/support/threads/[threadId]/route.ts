import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import {
  listSupportMessagesForStaff,
  staffReplyToSupportThread,
} from "@/lib/database/services/supportMessages";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { threadId: string } }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ messages: [] });
  }

  try {
    const messages = await listSupportMessagesForStaff(params.threadId);
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load messages." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

    await staffReplyToSupportThread({ threadId: params.threadId, body: message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send reply." },
      { status: 500 }
    );
  }
}
