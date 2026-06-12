import { NextResponse } from "next/server";
import {
  createSupportThread,
  listSupportThreads,
  type SupportCategory,
} from "@/lib/database/services/supportMessages";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const CATEGORIES: SupportCategory[] = [
  "technical",
  "payment",
  "gameplay",
  "bug",
  "feedback",
  "feature",
  "general",
  "game",
];

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ threads: [] });
  }

  try {
    const threads = await listSupportThreads(user.email);
    return NextResponse.json({ threads });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load threads." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const body = (await request.json()) as {
      subject?: string;
      category?: SupportCategory;
      message?: string;
    };

    const subject = body.subject?.trim();
    const message = body.message?.trim();
    const category = CATEGORIES.includes(body.category as SupportCategory)
      ? (body.category as SupportCategory)
      : "general";

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required." },
        { status: 400 }
      );
    }

    const result = await createSupportThread({
      email: user.email,
      subject,
      category,
      body: message,
    });

    return NextResponse.json({ threadId: result.threadId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create thread." },
      { status: 500 }
    );
  }
}
