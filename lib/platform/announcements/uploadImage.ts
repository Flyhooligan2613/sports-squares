import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "platform-announcements";
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function resolveMimeType(file: File): string {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  return "webp";
}

export async function uploadAnnouncementImage(file: File): Promise<{
  publicUrl: string;
  width: number;
  height: number;
}> {
  const mime = resolveMimeType(file);

  if (!ALLOWED.has(mime)) {
    throw new Error("Unsupported format. Use JPG, PNG, or WEBP.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 4 MB or smaller after compression.");
  }

  if (file.size === 0) {
    throw new Error("Image file is empty.");
  }

  const ext = extensionForMime(mime);
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket")) {
      throw new Error(
        "Storage bucket missing. Run migration 031_announcement_storage_bucket.sql in Supabase SQL Editor."
      );
    }
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);

  return {
    publicUrl: data.publicUrl,
    width: 1080,
    height: 1350,
  };
}
