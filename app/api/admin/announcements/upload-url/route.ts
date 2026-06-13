import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getAuthorizedAdminUser } from "@/lib/auth/adminAuth";
import { isSupabaseAdminConfigured, getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "platform-announcements";
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

export async function POST(request: Request) {
  const admin = await getAuthorizedAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Sign in to Staff Portal first." }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server missing SUPABASE_SERVICE_ROLE_KEY — contact support." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { contentType?: string };
    const contentType = body.contentType?.trim() || "image/webp";

    if (!ALLOWED.has(contentType)) {
      return NextResponse.json({ error: "Unsupported image format." }, { status: 400 });
    }

    const filename = `${randomUUID()}.${extensionForMime(contentType)}`;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(filename);

    if (error) {
      const message = error.message.toLowerCase().includes("bucket")
        ? "Storage bucket missing. Run migration 031_announcement_storage_bucket.sql in Supabase SQL Editor."
        : error.message;
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(filename);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      token: data.token,
      publicUrl: publicData.publicUrl,
      contentType,
    });
  } catch (err) {
    console.error("[announcements/upload-url]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not prepare upload." },
      { status: 500 }
    );
  }
}
